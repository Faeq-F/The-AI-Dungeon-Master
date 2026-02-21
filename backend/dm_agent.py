"""
DM Agent: frontend geminiService logic in Python.

Flow: 1) Query Snowflake for monster/compendium data.
      2) Call OpenRouter (google/gemini-2.5-pro) with that context + player stats + message.
      3) Return narrative + updated stats to the frontend.
"""

import json
import os
import re
from typing import Any

from openai import OpenAI

from snowflake_db import fetch_monster, fetch_monster_stats, update_player_stats

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"
OPENROUTER_MODEL = "google/gemini-2.5-pro"


DM_SYSTEM_INSTRUCTION = """
You are a World-Class Dungeon Master (DM) for a Dungeons & Dragons game.
Your goal is to provide an immersive, rules-consistent narrative experience.

RULES:
1. TRACK STATE: You must always be aware of the player's HP, Gold, and Inventory.
2. USE COMPENDIUM: When compendium data is provided below, use it for monster stats, items, or lore. Be accurate to that data.
3. NARRATION: Be descriptive and dramatic. Don't just say "You see a goblin." Say "From the flickering shadows of the damp cavern, a small, green-skinned figure emerges, clutching a jagged rusted blade."
4. D&D 5E RULES: Use standard 5th Edition rules for combat and checks.

Respond with ONLY valid JSON in this exact shape (no other text):
{"narrative": "2-5 sentences of what happens next.", "hp_change": 0, "xp_change": 0, "gold_change": 0, "new_items": []}

- narrative: the story result.
- hp_change, xp_change, gold_change: integers (negative or positive).
- new_items: list of new item names (strings) to add to inventory, or [].
"""


def _extract_search_terms(message: str) -> list[str]:
    """Extract possible compendium search terms from the player message."""
    terms = []
    # Quoted strings
    for m in re.finditer(r'["\']([^"\']+)["\']', message):
        terms.append(m.group(1).strip())
    # Single words that might be entity names (skip common words)
    skip = {"the", "and", "you", "your", "for", "with", "attack", "look", "take", "use", "go", "move"}
    for word in re.findall(r"\b[A-Za-z][A-Za-z0-9']*\b", message):
        w = word.strip()
        if len(w) > 2 and w.lower() not in skip and w not in terms:
            terms.append(w)
    return terms[:5]  # Limit to a few lookups per turn


def _get_monster_stats_for_message(message: str) -> dict[str, Any] | None:
    """
    Scan the player message for monster names; for the first candidate, call fetch_monster_stats.
    Returns dict with name, hp, ac (and optionally type, abilities) or None if none found.
    """
    terms = _extract_search_terms(message)
    for term in terms:
        if not term or len(term) < 2:
            continue
        row = fetch_monster_stats(term)
        if row and (row.get("hp") is not None or row.get("ac") is not None):
            return row
    return None


def _query_compendium(message: str) -> tuple[list[dict[str, Any]], dict[str, Any] | None]:
    """
    Query Snowflake for monster/compendium data first.
    Returns (list of compendium entries found, first monster dict or None).
    """
    terms = _extract_search_terms(message)
    entries = []
    first_monster = None
    seen = set()
    for term in terms:
        if not term or term.upper() in seen:
            continue
        seen.add(term.upper())
        row = fetch_monster(term)
        if row:
            entries.append(row)
            if first_monster is None and (row.get("type") or "").lower() in ("monster", "creature", ""):
                first_monster = row
    if first_monster is None and entries:
        first_monster = entries[0]
    return entries, first_monster


def _call_openrouter(
    message: str,
    stats: dict[str, Any],
    compendium_entries: list[dict[str, Any]],
    monster_stats: dict[str, Any] | None = None,
) -> dict[str, Any]:
    """Call OpenRouter (google/gemini-2.5-pro) with DM instruction + compendium context + stats + message; return parsed JSON."""
    api_key = os.environ.get("OPENROUTER_API_KEY") or os.environ.get("API_KEY", "")
    if not api_key:
        return {
            "narrative": "Set OPENROUTER_API_KEY or API_KEY to enable the Dungeon Master.",
            "hp_change": 0,
            "xp_change": 0,
            "gold_change": 0,
            "new_items": [],
        }
    hp = stats.get("hp", 100)
    xp = stats.get("xp", 0)
    gold = stats.get("gold", 0)
    inv = stats.get("inventory") or []
    inv_str = ", ".join(inv) if inv else "none"
    compendium_blob = "No compendium data for this turn."
    if compendium_entries:
        compendium_blob = "\n".join(
            json.dumps(e, ensure_ascii=False) for e in compendium_entries
        )
    user_content = f"""COMPENDIUM DATA (from Snowflake):
{compendium_blob}

CURRENT PLAYER STATE: HP={hp}, XP={xp}, Gold={gold}, Inventory=[{inv_str}]

PLAYER MESSAGE: {message}

Respond with ONLY the JSON object (narrative, hp_change, xp_change, gold_change, new_items). No markdown."""

    system_content = DM_SYSTEM_INSTRUCTION
    if monster_stats:
        m_name = monster_stats.get("name", "Unknown")
        m_hp = monster_stats.get("hp")
        m_ac = monster_stats.get("ac")
        parts = [f"ENCOUNTER MONSTER: {m_name}."]
        if m_hp is not None:
            parts.append(f"HP = {m_hp}.")
        if m_ac is not None:
            parts.append(f"AC = {m_ac}.")
        system_content += "\n\n" + " ".join(parts)
        system_content += " You MUST use these exact stats for the encounter. Do not hallucinate different HP or AC values."

    try:
        client = OpenAI(
            base_url=OPENROUTER_BASE_URL,
            api_key=api_key,
        )
        response = client.chat.completions.create(
            model=OPENROUTER_MODEL,
            messages=[
                {"role": "system", "content": system_content},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
        )
        text = (response.choices[0].message.content or "").strip()
        if text.startswith("```"):
            lines = text.split("\n")
            text = "\n".join(lines[1:-1] if lines[-1].strip() == "```" else lines[1:])
        return json.loads(text)
    except Exception:
        return {
            "narrative": "The DM could not process that action.",
            "hp_change": 0,
            "xp_change": 0,
            "gold_change": 0,
            "new_items": [],
        }


def run_turn(
    message: str,
    stats: dict[str, Any],
    player_id: str | None = None,
) -> dict[str, Any]:
    """
    Run one DM turn: 1) Query Snowflake for monster data, 2) Call OpenRouter (Gemini), 3) Apply updates and persist to Snowflake.

    Args:
        message: Player message (e.g. "I attack the dragon").
        stats: Current stats dict with hp, xp, gold, inventory.
        player_id: Optional player id for Snowflake.

    Returns:
        {
            "narrative": str,
            "stats": { "hp", "xp", "gold", "inventory" },
            "monster": { ... } or null if no compendium hit,
        }
    """
    stats = dict(stats)
    inventory = stats.get("inventory")
    if not isinstance(inventory, list):
        inventory = list(inventory) if inventory else []
    stats["inventory"] = inventory
    hp = stats.get("hp", 100)
    xp = stats.get("xp", 0)
    gold = stats.get("gold", 0)

    # scan message for monster names; if found, fetch exact HP/AC from Snowflake
    monster_stats = _get_monster_stats_for_message(message)

    # query Snowflake for monster/compendium data (for general context)
    compendium_entries, first_monster = _query_compendium(message)

    # call OpenRouter with compendium + monster stats (HP/AC in system prompt) + message
    result = _call_openrouter(message, stats, compendium_entries, monster_stats=monster_stats)
    narrative = result.get("narrative", "")
    hp_change = result.get("hp_change", 0)
    xp_change = result.get("xp_change", 0)
    gold_change = result.get("gold_change", 0)
    new_items = result.get("new_items")
    if not isinstance(new_items, list):
        new_items = []

    new_hp = max(0, hp + hp_change)
    new_xp = max(0, xp + xp_change)
    new_gold = max(0, gold + gold_change)
    new_inventory = inventory + new_items
    new_stats = {
        "hp": new_hp,
        "xp": new_xp,
        "gold": new_gold,
        "inventory": new_inventory,
    }
    if player_id:
        new_stats["player_id"] = player_id

    # persist updated stats to Snowflake (equivalent of updateCharacterStats tool)
    try:
        update_player_stats(new_stats)
    except Exception:
        pass

    out = {"narrative": narrative, "stats": new_stats}
    if first_monster is not None:
        out["monster"] = first_monster
    return out
