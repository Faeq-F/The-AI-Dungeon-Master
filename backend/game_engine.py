import os
import snowflake.connector
import json
from dotenv import load_dotenv

load_dotenv()

def get_db_connection():
    return snowflake.connector.connect(
        user=os.getenv('SNOWFLAKE_USER'),
        password=os.getenv('SNOWFLAKE_PASSWORD'),
        account=os.getenv('SNOWFLAKE_ACCOUNT'),
        warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
        database=os.getenv('SNOWFLAKE_DATABASE'),
        schema=os.getenv('SNOWFLAKE_SCHEMA')
        
    )

def save_turn_to_snowflake(player_name, action, narrative):
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # Change GAME_HISTORY to DND_PROJECT.PUBLIC.GAME_HISTORY
        query = """
        INSERT INTO DND_PROJECT.PUBLIC.GAME_HISTORY (PLAYER_NAME, ACTION_TAKEN, DM_NARRATIVE)
        VALUES (%s, %s, %s)
        """
        cursor.execute(query, (player_name, action, narrative))
        conn.commit()
        print("💾 Turn saved to Snowflake!")
    finally:
        cursor.close()
        conn.close()
# Example usage test:
# save_turn_to_snowflake("Leeroy Jenkins", "I charge into the room!", "The orcs look at you in confusion.")

def lookup_monster(monster_name):
    """Searches the MONSTERS table using the correct column name: VARIANT_COL."""
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        # We use "VARIANT_COL" because that is what Snowflake named it
        query = """
        SELECT "VARIANT_COL" 
        FROM "DND_PROJECT"."PUBLIC"."MONSTERS" 
        WHERE "VARIANT_COL":name::string ILIKE %s
        LIMIT 1
        """
        cursor.execute(query, (f"%{monster_name}%",))
        result = cursor.fetchone()
        
        if result:
            # Parse the JSON string into a Python dictionary
            return json.loads(result[0]) if isinstance(result[0], str) else result[0]
        return None
    finally:
        cursor.close()
        conn.close()
