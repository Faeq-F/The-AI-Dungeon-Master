"""
Snowflake connection and game data access.

Expects env vars: SNOWFLAKE_ACCOUNT, SNOWFLAKE_USER, SNOWFLAKE_PASSWORD,
SNOWFLAKE_WAREHOUSE, SNOWFLAKE_DATABASE, SNOWFLAKE_SCHEMA.

Expected tables (adjust names to match your Snowflake schema):
  - COMPENDIUM: name, type, hp, ac, description (monsters/items/lore)
  - PLAYER_STATS: player_id, hp, gold, xp, inventory (JSON or array column)
  - GAME_HISTORY: player_name, action, narrative, stats (VARIANT)
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


def save_game_turn(
    player_name: str,
    action: str,
    narrative: str,
    stats: dict[str, Any],
) -> None:
    """
    Insert a new row into GAME_HISTORY for this turn.
    stats is serialized with json.dumps() and stored in a VARIANT column.
    """
    conn = None
    try:
        conn = get_connection()
        cur = conn.cursor()
        stats_json = json.dumps(stats) if stats is not None else "{}"
        cur.execute(
            """
            INSERT INTO GAME_HISTORY (player_name, action, narrative, stats)
            VALUES (%s, %s, %s, PARSE_JSON(%s))
            """,
            (player_name, action, narrative, stats_json),
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


def fetch_monster_stats(monster_name):
    """
    Searches Snowflake for a monster and returns its stats.
    Using 'ILIKE' makes it find 'Goblin' even if the player types 'goblin'.
    """
    conn = get_connection() # Uses your existing connection logic
    cursor = conn.cursor()
    
    query = """
    SELECT 
        DATA:name::string as name,
        DATA:hit_points::int as hp,
        DATA:armor_class[0].value::int as ac,
        DATA:type::string as type,
        DATA:special_abilities::variant as abilities
    FROM MONSTERS
    WHERE DATA:name::string ILIKE %s
    LIMIT 1
    """
    
    try:
        cursor.execute(query, (f"%{monster_name}%",))
        result = cursor.fetchone()
        if result:
            return {
                "name": result[0],
                "hp": result[1],
                "ac": result[2],
                "type": result[3],
                "abilities": result[4]
            }
        return None
    finally:
        cursor.close()
        conn.close()