
# 📖 Autonomous Dungeon Master Agent (Edge Edition)

Welcome to the **Autonomous DM Agent** — a sophisticated, AI-driven Dungeon Master dashboard designed to run at the "Edge" (optimized for Raspberry Pi 5). This system leverages Google's **Gemini 3 Pro** and simulated **Snowflake** RAG (Retrieval-Augmented Generation) to manage a seamless D&D campaign.

## 🌌 Project Overview

This agent isn't just a chatbot; it's a systems-aware game engine. 
- **The Brain**: Gemini 3 Pro handles complex narrative branching and rules enforcement.
- **The Memory**: Snowflake acts as the long-term storage for "World Knowledge" (Monsters, Items) and "Game Logs" (Player History).
- **The Interface**: The **Arcane Tactical Grid v1** provides a high-fidelity cyberpunk/fantasy HUD for tracking squad vitals and narrative flow.

---

## 🛠️ Local Setup Instructions (Node.js)

Since this application uses React, TypeScript, and Vite, you need Node.js installed to run the development server.

### 1. Prerequisites
- **Node.js**: Version 18 or higher recommended.
- **Google Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation
Clone the project directory and install the necessary dependencies:

```bash
# Initialize npm if you haven't already
npm install

# Install dependencies manually if needed
npm install vite @google/genai react react-dom
```

### 3. Environment Configuration
The application requires your API key to communicate with the Gemini models. The `vite.config.ts` is pre-configured to inject `process.env.API_KEY`.

#### On Windows (PowerShell):
```powershell
$env:API_KEY="your_actual_api_key_here"; npm run dev
```

#### On Windows (Command Prompt):
```cmd
set API_KEY=your_actual_api_key_here && npm run dev
```

#### On Mac / Linux / Raspberry Pi:
```bash
API_KEY=your_actual_api_key_here npm run dev
```

### 4. Access the Dashboard
Once the server starts, Vite will provide a local URL (typically `http://localhost:5173`). Open this in your browser to initialize the squad.

---

## 🎮 How to Play

1. **Squad Initialization**: Select your unit count (1-4) to boot up the Arcane Tactical Grid.
2. **The HUD**:
    - **Vital Orbs**: Track health and sync-rates for your party members.
    - **Narrative Terminal**: Use the center input to "Initiate Dialogue" with the DM.
    - **System Log**: Monitor the footer for live updates on neural links and Snowflake database synchronization status.
3. **Snowflake Integration**: The DM automatically queries the "Compendium" when you mention monsters or items, and updates your character sheet stats in real-time.

## 🧬 Tech Stack
- **Frontend**: React 19, Tailwind CSS
- **AI**: @google/genai (Gemini 3 Pro Preview)
- **Tooling**: Vite (Node.js)
- **Aesthetics**: Arcane Tactical Grid (Cyber-Fantasy HUD)

---
*Developed for the Edge. Powered by Gemini. Persisted by Snowflake.*
