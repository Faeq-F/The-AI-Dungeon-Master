import os
import snowflake.connector
from dotenv import load_dotenv

# 1. Load your .env file
load_dotenv()

def test_snowflake():
    try:
        # 2. Establish connection using your .env variables
        conn = snowflake.connector.connect(
            user=os.getenv('SNOWFLAKE_USER'),
            password=os.getenv('SNOWFLAKE_PASSWORD'),
            account=os.getenv('SNOWFLAKE_ACCOUNT'),
            warehouse=os.getenv('SNOWFLAKE_WAREHOUSE'),
            database=os.getenv('SNOWFLAKE_DATABASE'),
            schema=os.getenv('SNOWFLAKE_SCHEMA')
        )

        # 3. Create a cursor and run a simple query
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM MONSTERS")
        count = cursor.fetchone()[0]

        print(f"Success! Connected to Snowflake.")
        print(f"Found {count} monsters in your 'MONSTERS' table.")

        cursor.close()
        conn.close()
    except Exception as e:
        print(f"Connection Failed: {e}")

if __name__ == "__main__":
    test_snowflake()