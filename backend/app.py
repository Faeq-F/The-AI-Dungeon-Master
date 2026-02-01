"""
Flask backend: /api/game-action and /api/stats for React frontend.
Uses dm_agent (Snowflake first, then OpenRouter/Gemini). CharacterSheet and GameLog fetch from GET /api/stats.
"""

import time
from pathlib import Path

from dotenv import load_dotenv

# Load .env from backend/ so OPENROUTER_API_KEY, SNOWFLAKE_*, etc. are set
load_dotenv(Path(__file__).resolve().parent / ".env")

from flask import Flask, jsonify, request
from flask_cors import CORS

from dm_agent import run_turn

app = Flask(__name__)
CORS(app, origins=["http://localhost:5173", "http://127.0.0.1:5173"])  # Vite default

# In-memory store for characters and logs (CharacterSheet and GameLog fetch from GET /api/stats)
DEFAULT_CHARACTER = {
    "id": "valerius-bold-001",
    "name": "Valerius the Bold",
    "class": "Fighter",
    "level": 1,
    "hp": 12,
    "maxHp": 12,
    "ac": 16,
    "gold": 15,
    "xp": 0,
    "inventory": ["Longsword", "Shield", "Leather Armor", "Rations (5)"],
    "str": 16,
    "dex": 14,
    "con": 15,
    "int": 10,
    "wis": 12,
    "cha": 8,
}
_store = {"characters": [DEFAULT_CHARACTER.copy()], "logs": []}


@app.route("/")
def index():
    """Root route so visiting http://localhost:5000/ doesn't 404."""
    return jsonify({
        "message": "API is running. Use the frontend at http://localhost:5173",
        "endpoints": {
            "GET /api/stats": "Characters and logs for the dashboard",
            "POST /api/game-action": "Send a player action, get narrative + updated stats",
            "GET /api/health": "Health check",
        },
    })


@app.route("/api/stats", methods=["GET"])
def get_stats():
    """Return characters and logs for CharacterSheet and GameLog."""
    return jsonify(_store)


@app.route("/api/game-action", methods=["POST"])
def game_action():
    """
    POST body: { "action": "player message", "stats": { "hp", "gold", "xp", "inventory" }, "player_id": "optional" }
    Flow: 1) Query Snowflake for monster data, 2) Call Gemini, 3) Update store and return result.
    """
    data = request.get_json(silent=True) or {}
    action = (data.get("action") or "").strip()
    if not action:
        return jsonify({"error": "Missing 'action' in request body"}), 400

    stats = data.get("stats") or {}
    player_id = data.get("player_id")
    # Use current character from store if stats not provided
    if not stats and _store["characters"]:
        c = _store["characters"][0]
        stats = {"hp": c.get("hp"), "gold": c.get("gold"), "xp": c.get("xp"), "inventory": c.get("inventory", [])}

    result = run_turn(message=action, stats=stats, player_id=player_id)
    narrative = result.get("narrative", "")
    new_stats = result.get("stats", {})

    # Update store: merge into first character and append logs
    if _store["characters"]:
        cur = _store["characters"][0]
        cur["hp"] = new_stats.get("hp", cur.get("hp"))
        cur["xp"] = new_stats.get("xp", cur.get("xp"))
        cur["gold"] = new_stats.get("gold", cur.get("gold"))
        cur["inventory"] = new_stats.get("inventory", cur.get("inventory", []))
    ts = time.time()
    _store["logs"].append({
        "id": f"user-{ts}",
        "timestamp": time.strftime("%H:%M:%S", time.localtime(ts)),
        "role": "user",
        "content": action,
        "isSnowflakeSynced": False,
    })
    _store["logs"].append({
        "id": f"dm-{ts}",
        "timestamp": time.strftime("%H:%M:%S", time.localtime(ts)),
        "role": "dm",
        "content": narrative,
        "isSnowflakeSynced": True,
    })

    return jsonify(result)


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
