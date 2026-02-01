"""
Snowflake connection and game data access.

Expects env vars: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD,
SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA.

Expected tables (adjust names to match your Snowflake schema):
  - COMPENDIUM: name, type, hp, ac, description (monsters/items/lore)
  - PLAYER_STATS: player_id, hp, gold, xp, inventory (JSON or array column)
"""

import json
import os
from typing import Any

import snowflake.connector


def get_connection():
    """Return a Snowflake connection using environment variables."""
    return snowflake.connector.connect(
        account=os.environ.get("SNOWFLAKE_ACCOUNT", ""),
        user=os.environ.get("SNOWFLAKE_USER", ""),
        password=os.environ.get("SNOWFLAKE_PASSWORD", ""),
        warehouse=os.environ.get("SNOWFLAKE_WAREHOUSE", ""),
        database=os.environ.get("SNOWFLAKE_DATABASE", ""),
        schema=os.environ.get("SNOWFLAKE_SCHEMA", "PUBLIC"),
    )


def fetch_monster(name: str) -> dict[str, Any] | None:
    """
    Look up a monster (or compendium entry) by name in Snowflake.
    Returns a dict with keys like name, type, hp, ac, description, or None if not found.
    """
    if not name or not name.strip():
        return None
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        # Adjust table/column names to match your schema
        cur.execute(
            """
            SELECT name, type, hp, ac, description
            FROM COMPENDIUM
            WHERE UPPER(TRIM(name)) = UPPER(TRIM(%s))
            LIMIT 1
            """,
            (name.strip(),),
        )
        row = cur.fetchone()
        cur.close()
        if row is None:
            return None
        return {
            "name": row[0],
            "type": row[1],
            "hp": row[2],
            "ac": row[3],
            "description": row[4] or "",
        }
    except Exception:
        return None
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass


def update_player_stats(stats: dict[str, Any]) -> None:
    """
    Update player stats in Snowflake (HP, gold, XP, inventory).
    stats: dict with keys hp, gold, xp, inventory (list of strings).
    Uses player_id from stats if present; otherwise updates a default row.
    """
    if not stats:
        return
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        player_id = stats.get("player_id") or "default"
        hp = stats.get("hp")
        gold = stats.get("gold")
        xp = stats.get("xp")
        inventory = stats.get("inventory")
        if inventory is not None and not isinstance(inventory, list):
            inventory = [inventory] if inventory else []
        inv_json = json.dumps(inventory) if inventory is not None else "[]"

        # Adjust table/column names to match your schema
        cur.execute(
            """
            MERGE INTO PLAYER_STATS AS t
            USING (SELECT %s AS player_id) AS s
            ON t.player_id = s.player_id
            WHEN MATCHED THEN UPDATE SET
                hp = COALESCE(%s, t.hp),
                gold = COALESCE(%s, t.gold),
                xp = COALESCE(%s, t.xp),
                inventory = COALESCE(PARSE_JSON(%s), t.inventory),
                updated_at = CURRENT_TIMESTAMP()
            WHEN NOT MATCHED THEN INSERT (player_id, hp, gold, xp, inventory, updated_at)
            VALUES (%s, COALESCE(%s, 100), COALESCE(%s, 0), COALESCE(%s, 0), PARSE_JSON(%s), CURRENT_TIMESTAMP())
            """,
            (player_id, hp, gold, xp, inv_json, player_id, hp, gold, xp, inv_json),
        )
        conn.commit()
        cur.close()
    except Exception:
        if conn:
            try:
                conn.rollback()
            except Exception:
                pass
        raise
    finally:
        if conn:
            try:
                conn.close()
            except Exception:
                pass
