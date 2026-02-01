import { GoogleGenAI, Type, FunctionDeclaration, Modality } from "@google/genai";
import { DM_SYSTEM_INSTRUCTION } from "../constants";

// Tool: Query Snowflake Compendium (RAG)
export const queryCompendiumTool: FunctionDeclaration = {
  name: 'queryCompendium',
  parameters: {
    type: Type.OBJECT,
    description: 'Search the Snowflake COMPENDIUM table for monster stats, item lore, or world history.',
    properties: {
      searchTerm: {
        type: Type.STRING,
        description: 'The name of the entity to look up (e.g., "Ancient Red Dragon", "Health Potion").',
      },
    },
    required: ['searchTerm'],
  },
};

// Tool: Update Character Sheet in Snowflake
export const updateCharacterStatsTool: FunctionDeclaration = {
  name: 'updateCharacterStats',
  parameters: {
    type: Type.OBJECT,
    description: 'Save updated player stats (HP, Gold, XP) to the Snowflake database.',
    properties: {
      hp: { type: Type.NUMBER },
      gold: { type: Type.NUMBER },
      xp: { type: Type.NUMBER },
      inventory: { type: Type.ARRAY, items: { type: Type.STRING } },
    },
  },
};

// Tool: Save Game Log to Snowflake
export const saveGameLogTool: FunctionDeclaration = {
  name: 'saveGameLog',
  parameters: {
    type: Type.OBJECT,
    description: 'Persist the current interaction to the Snowflake GAME_LOGS table.',
    properties: {
      summary: { type: Type.STRING, description: 'A short summary of what happened this turn.' },
    },
    required: ['summary'],
  },
};


export const createAiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

// Text-based fallback chat
const ai = createAiClient();
export const textChat = ai.chats.create({
  model: 'gemini-3-flash-preview',
  config: {
    systemInstruction: DM_SYSTEM_INSTRUCTION + "\nIMPORTANT: Always provide a narrative response in text, even if calling a tool.",
    tools: [{ functionDeclarations: [queryCompendiumTool, updateCharacterStatsTool, saveGameLogTool] }],
  },
});
