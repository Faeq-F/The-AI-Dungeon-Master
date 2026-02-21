# Backend

(Flask + Snowflake + OpenRouter/Gemini)

- **snowflake_db.py** — Snowflake connection and helpers:
  - `fetch_monster(name)` — Look up a compendium entry (monster/item) by name. Returns `{ name, type, hp, ac, description }` or `None`.
  - `update_player_stats(stats)` — Update player stats. `stats`: `{ player_id?, hp, gold, xp, inventory }`. Uses tables `COMPENDIUM` and `PLAYER_STATS`; adjust table/column names in the file to match your Snowflake schema.

- **dm_agent.py** — DM logic: queries Snowflake for compendium data, then calls **OpenRouter** (`google/gemini-2.5-pro`) via the OpenAI Python library. Returns structured JSON: `narrative`, `hp_change`, `xp_change`, `gold_change`, `new_items`.

- **app.py** — Flask API:
  - **POST /api/game-action** — Body: `{ "action": "player message", "stats": { "hp", "gold", "xp", "inventory" }, "player_id": "optional" }`. Returns `{ "narrative", "stats", "monster"? }`. Uses dm_agent (OpenRouter) for narrative and stat deltas.
  - **GET /api/stats** — Returns `{ characters, logs }` for CharacterSheet and GameLog.
  - **GET /api/health** — Health check.

## Env vars

- **OPENROUTER_API_KEY** or **API_KEY** — Required for `/api/game-action` (OpenRouter; model `google/gemini-2.5-pro`). Get a key at [OpenRouter](https://openrouter.ai/keys).
- **SNOWFLAKE_ACCOUNT**, **SNOWFLAKE_USER**, **SNOWFLAKE_PASSWORD**, **SNOWFLAKE_WAREHOUSE**, **SNOWFLAKE_DATABASE**, **SNOWFLAKE_SCHEMA** — Required for `fetch_monster` and `update_player_stats`. Set to empty if you want to run without Snowflake (narrative still works; DB calls will no-op or error).

## Run

```bash
cd backend
python -m venv venv
source venv/bin/activate   # or venv\Scripts\activate on Windows
pip install -r requirements.txt
export OPENROUTER_API_KEY=your-key
# optional: set SNOWFLAKE_* vars
python app.py
```

Server listens on `http://0.0.0.0:5000`. React (Vite on 5173) is allowed by CORS.