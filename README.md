# AI Dungeon Master Agent

The **AI Dungeon Master Agent** is an AI-driven Dungeon Master dashboard, optimized for the Raspberry Pi 5. This uses various Eleven Labs voice agents, Google's Gemini 3 Pro and simulated Snowflake RAG (Retrieval-Augmented Generation) to manage a seamless D&D campaign.

<details><summary>Game Lore & Story</summary>
General Lore:

Travellers from a distant land travel across the fallen nation of Britannia that once ruled the lands, searching for the answer of what happened on that Day 5 years before hand. Each traveller’s abilities depend on the player’s character and stats.

Some whisper that the truth lies with a long-forgotten order of mages, said to have vanished thousands of years ago. Few dare speak their name, and those who do speak only in riddles or half-truths.

A lone ferryman appears along their path, speaking in half-clues and warnings. He claims knowledge of the events that felled Britannia, but his motives and true allegiance remain unclear.

One night, all four travellers shared the same haunting dream: visions of their homeland falling as Britannia did. Whether fate, magic, or some unknown hand guided them, none could tell—but the dream compelled them to act.

Many theories remain through the land, experimental magic gone wrong, rivalling nations (potentially) attacking but none had proof, only rumours and half-told truths, only a few warned that some unseen hands distorted the truth, which our travellers hoped to discover.


Intro Story:


Along a silent, barren land walk 4 travellers, their footsteps echoing across the ruins of what was once the great nation of Britannia. The paths they walk along once carried kings, merchants and marching hosts, but now they only carry dust and memories of lively towns. Destroyed keeps loom over the horizon, the banners they once held fallen.

The travellers have come to look for the answer that haunts every free kingdom; How did this Great nation fall on that day? What happened to this realm that once ruled the known world, whose power had known no rival crumble in a single day?

Five years after that day, our travellers—strangers to this land, born beyond the seas in a nation once bound to Britannia’s iron crown, and freed, like all others, on the day this great realm fell silent—walk upon the empty roads, searching for the truth of that day, buried beneath stone, ash, and forgotten songs.

It is said in their homelands that there is nothing to find in this realm, that all that remains of the realm is memories of a once great nations; these roads would have them believe it. Yet, silence is not emptiness, and rumours of villages not wiped out, camps

set throughout the realm following that Day would have our travellers cling to the hope that there remains an answer to be found.

[The road ends. Wind moves through dead grass]

Player 1: “… this is the crossroads the ferrymen spoke of.”

Player 2: (glancing around) “A crossroads needs more than one road, all that lay before us is dust and rubble.”

Player 3: “He said that the marker would be here, if it wishes to be found”

Player 4: “It will be god willing.”

(They pause; no sound follows – not even an echo)

Player 2: “Doesn’t it trouble you that nothing lives here, no crows, no insects, nothing?”

Player 3: “Britannia has been dead a long time, its to be expected. Corpses remain silent eventually.”

Player 2: “Yeah but doesn’t it bother you that there are no remains either, no sign of life at all, it almost seems like they never existed”

Player 1: (kneeling to the ground, brushing dust from a flat stone) “Perhaps we’re looking in the wrong way… maybe the crossroads isn’t just a place on a map.”

Player 4: “You mean… some kind of magic?”

Player 1: “Not magic we understand. Something old… perhaps even older than Britannia itself. Something the ferryman knew enough to warn us about.”

(They stand in silence, scanning the horizon. The wind whispers through the broken banners, carrying nothing but dust.)

Player 2: “I’ve seen ruins before. I’ve seen empty towns… but this… it’s as if the land swallowed them whole. Maybe the stories were true—there’s nothing to find here.”

Player 3: “Or maybe we aren’t looking yet.”

(The travelers begin to turn away, disappointment pressing on their shoulders. As their backs face the desolate crossroads, a sudden blinding light bursts from the ground beneath the flat stone Player 1 had inspected. They stumble backward, shielding their eyes.)

Player 4: “By the gods… what is that?”

(When the light dims, a faint, glowing marker rises from the stone. It pulses softly, pointing toward the north. The travelers exchange wide-eyed glances.)

Player 1: “It… it’s showing us the way. The marker.”

Player 2: “But where…?”

(Following the pulse of the marker, the group moves cautiously through the dust-choked landscape. After what feels like hours, the marker leads them to a hidden village, obscured by tall, twisted trees. From afar, it is clear the settlement is silent, abandoned, and in ruins.)

Player 3: “It’s… it’s still here.”

Player 4: “But… look at it. Nothing survives. Not a soul.”

Player 1: “We need to investigate. There could be answers here—maybe clues to what happened to Britannia… or why this village was hidden.”

Player 2: “Careful. Whatever happened here… it didn’t spare anyone.”

(The four travellers’ step into the ruined village, boots crunching on shattered tiles and overgrown cobblestones. The wind moves through the empty streets, carrying whispers that may be memories—or warnings.)

Player 3: “Keep your eyes open. The ferryman’s clues brought us this far… but whatever waits here, it wants to remain forgotten.”

(The camera of the story—or the narrative focus—pulls back as the travellers move deeper into the village, the ruins stretching endlessly before them. The faint pulse of the marker fades, leaving only silence… and the sense that the first answers will not come easily.)

[END OF INTRO STORY]
</details>
<br />
<a href="https://devpost.com/software/the-ai-dungeon-master">Submitted to Royal Hackaway v9</a>

## Project Overview

This agent isn't just a chatbot; it's an aware game engine.
- **The Brain**: Gemini 3 Pro handles complex narrative branching and rules enforcement.
- **The Memory**: Snowflake acts as the long-term storage for "World Knowledge" (Monsters, Items) and "Game Logs" (Player History).
- **The Interface**: The Arcane Tactical Grid provides a high-fidelity cyberpunk / fantasy HUD for tracking squad vitals and narrative flow with Eleven Labs.

## How to Play

1. **Squad Initialization**: Select your unit count (1-4) to boot up the Arcane Tactical Grid.
2. **The HUD**:
    - **Vital Orbs**: Track health and sync-rates for your party members.
    - **Narrative Terminal**: Use the center input to "Initiate Dialogue" with the Dungeon Master.
    - **System Log**: Monitor the footer for live updates on neural links and Snowflake database synchronization status.
3. **Snowflake Integration**: The Dungeon Master automatically queries the "Compendium" when you mention monsters or items, and updates your character sheet stats in real-time.

## Tech Stack
- **Frontend**: React 19, Tailwind CSS
- **AI**: @google/genai (Gemini 3 Pro Preview), 11 Eleven Labs
- **Tooling**: Vite (Node.js)
- **Aesthetics**: Arcane Tactical Grid (Cyber-Fantasy HUD)

## Local Setup Instructions

### 1. Prerequisites
- **Node.js**: Version 18 or higher recommended.
- **Google Gemini API Key**: Obtain one from [Google AI Studio](https://aistudio.google.com/).

### 2. Installation
Clone the project directory and install the necessary dependencies:

```bash
npm install
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

## Authors & Acknowledgements

Faeq Faisal<br>
Edis Svraka<br>
Andre Mohammed<br>
Hamza Hassan