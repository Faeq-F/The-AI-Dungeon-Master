
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterSheet from './components/CharacterSheet';
import GameLog from './components/GameLog';
import Terminal from './components/Terminal';
import { CharacterStats, GameEntry } from './types';
import { INITIAL_CHARACTER } from './constants';
import { createAiClient, queryCompendiumTool, updateCharacterStatsTool, saveGameLogTool } from './services/geminiService';
import { audioService } from './services/audioService';

// Mock Snowflake Data for Demonstration
const MOCK_SNOWFLAKE_COMPENDIUM: Record<string, any> = {
  "goblin": { hp: 7, ac: 13, attack: "Scimitar +4 (1d6+2)", lore: "Small, malicious humanoids that dwell in caves." },
  "dragon": { hp: 256, ac: 19, attack: "Fire Breath (15d6)", lore: "A legendary beast of immense power and greed." }
};

const App: React.FC = () => {
  const [character, setCharacter] = useState<CharacterStats>(INITIAL_CHARACTER);
  const [logs, setLogs] = useState<GameEntry[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLive, setIsLive] = useState(false);
  
  const aiRef = useRef(createAiClient());
  const chatRef = useRef<any>(null);

  useEffect(() => {
    // Initialize standard chat
    const ai = createAiClient();
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        tools: [{ functionDeclarations: [queryCompendiumTool, updateCharacterStatsTool, saveGameLogTool] }],
      },
    });
  }, []);

  const handleTools = async (functionCalls: any[]) => {
    const results = [];
    for (const fc of functionCalls) {
      setIsSyncing(true);
      console.log(`[Snowflake Operation] Calling: ${fc.name}`, fc.args);
      
      // Simulate Pi -> Snowflake Latency
      await new Promise(r => setTimeout(r, 1000));

      let result = "Success";
      if (fc.name === 'updateCharacterStats') {
        setCharacter(prev => ({ ...prev, ...fc.args }));
      } else if (fc.name === 'queryCompendium') {
        const term = fc.args.searchTerm.toLowerCase();
        result = MOCK_SNOWFLAKE_COMPENDIUM[term] || "No specific data found in Snowflake COMPENDIUM, use general D&D knowledge.";
      } else if (fc.name === 'saveGameLog') {
        setLogs(prev => prev.map(l => ({ ...l, isSnowflakeSynced: true })));
      }
      
      results.push({ name: fc.name, result });
      setIsSyncing(false);
    }
    return results;
  };

  const handleSendMessage = async (message: string) => {
    const userLog: GameEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      role: 'user',
      content: message,
      isSnowflakeSynced: false
    };

    setLogs(prev => [...prev, userLog]);
    setIsThinking(true);

    try {
      let response = await chatRef.current.sendMessage({ message });
      
      // If the model ONLY called tools, we need to send the tool results back 
      // to get a narrative response.
      if (response.candidates?.[0]?.content?.parts) {
        const calls = response.candidates[0].content.parts.filter(p => p.functionCall).map(p => p.functionCall);
        if (calls.length > 0) {
          const toolResults = await handleTools(calls);
          // In a real app, you'd send these results back to the model to get a "final" text response.
          // For now, if text is empty, we force a follow-up or use the provided text.
        }
      }

      const dmContent = response.text || "The Master consults the ancient scrolls (Updating Database)... What do you do next?";

      const dmLog: GameEntry = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
        role: 'dm',
        content: dmContent,
        isSnowflakeSynced: true
      };
      setLogs(prev => [...prev, dmLog]);

    } catch (error) {
      console.error("DM Error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleLive = () => {
    setIsLive(!isLive);
    // In a full implementation, this would trigger navigation.mediaDevices.getUserMedia
    // and sessionPromise.then(session => session.sendRealtimeInput)
    alert("Live Audio Mode: In a real Pi 5 environment, this initiates a high-speed websocket to Gemini for instant voice interaction!");
  };

  return (
    <div className="h-full w-full flex flex-col md:flex-row bg-[#080808]">
      <aside className="w-full md:w-80 lg:w-96 p-4 border-r border-emerald-900/20 flex flex-col gap-4 overflow-hidden bg-black">
        <div className="flex items-center justify-between p-3 bg-emerald-950/20 rounded-lg border border-emerald-900/30">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-emerald-500 font-bold text-xs fantasy-font uppercase">Node: Pi-Edge-01</h1>
          </div>
          <button 
            onClick={toggleLive}
            className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${isLive ? 'bg-red-600 text-white' : 'bg-emerald-900 text-emerald-400 hover:bg-emerald-700'}`}
          >
            {isLive ? 'STOP LIVE' : 'START LIVE VOICE'}
          </button>
        </div>
        
        <CharacterSheet stats={character} />
        
        <div className="bg-zinc-900/50 p-3 rounded border border-zinc-800 text-[10px] text-zinc-500 space-y-1">
          <p className="flex justify-between"><span>SNOWFLAKE ADAPTER:</span> <span className="text-emerald-500">CONNECTED</span></p>
          <p className="flex justify-between"><span>LORE RETRIEVAL:</span> <span className="text-emerald-500">ACTIVE</span></p>
          <p className="flex justify-between"><span>LATENCY:</span> <span>42ms</span></p>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-h-0 bg-[#0c0c0c] relative">
        <header className="p-4 border-b border-emerald-900/20 flex justify-between items-center bg-[#0d0d0d] z-10">
          <div className="flex items-center gap-4">
             <i className="fa-solid fa-dice-d20 text-emerald-500 text-xl animate-spin-slow"></i>
             <span className="fantasy-font text-emerald-500 font-bold uppercase tracking-widest">Snowflake Game Engine</span>
          </div>
          <div className="flex items-center gap-4 text-[10px]">
             <span className="text-zinc-600 uppercase">Memory Index: 4,092 Logs</span>
             <div className="flex items-center gap-1 text-blue-400">
               <i className="fa-solid fa-cloud"></i>
               <span>SFWK-PROD-01</span>
             </div>
          </div>
        </header>

        <GameLog logs={logs} />
        
        <Terminal 
          onSendMessage={handleSendMessage} 
          isThinking={isThinking} 
          isSyncing={isSyncing} 
        />
      </main>
    </div>
  );
};

export default App;
