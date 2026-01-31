
import React, { useState, useEffect, useCallback, useRef } from 'react';
import CharacterSheet from './components/CharacterSheet';
import GameLog from './components/GameLog';
import Terminal from './components/Terminal';
import { CharacterStats, GameEntry } from './types';
import { INITIAL_CHARACTER } from './constants';
import { createAiClient, queryCompendiumTool, updateCharacterStatsTool, saveGameLogTool } from './services/geminiService';
import { audioService } from './services/audioService';

const MOCK_CHARACTERS: CharacterStats[] = [
  { ...INITIAL_CHARACTER, name: "KAIZEN", class: "Infiltrator", level: 12 },
  { ...INITIAL_CHARACTER, name: "MIRA", class: "Technomancer", level: 11, hp: 8, themeColor: '#FF3131', avatar: 'auto_awesome' } as any,
  { ...INITIAL_CHARACTER, name: "JAX", class: "Shield-Core", level: 12, hp: 12, avatar: 'shield' } as any,
  { ...INITIAL_CHARACTER, name: "NYX", class: "Noise-Runner", level: 11, hp: 9, avatar: 'music_note' } as any,
];

const App: React.FC = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [unitCount, setUnitCount] = useState<number | null>(null);
  const [character, setCharacter] = useState<CharacterStats>(INITIAL_CHARACTER);
  const [logs, setLogs] = useState<GameEntry[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  
  const chatRef = useRef<any>(null);

  useEffect(() => {
    const ai = createAiClient();
    chatRef.current = ai.chats.create({
      model: 'gemini-3-pro-preview',
      config: {
        tools: [{ functionDeclarations: [queryCompendiumTool, updateCharacterStatsTool, saveGameLogTool] }],
      },
    });
  }, []);

  const handleStartMission = () => {
    if (unitCount) {
      setIsInitialized(true);
      handleSendMessage("Initialize mission protocol. Scanning sector...");
    }
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
      const response = await chatRef.current.sendMessage({ message });
      const dmContent = response.text || "Encryption active. Database update complete.";
      
      const dmLog: GameEntry = {
        id: (Date.now() + 1).toString(),
        timestamp: new Date().toLocaleTimeString(),
        role: 'dm',
        content: dmContent,
        isSnowflakeSynced: true
      };
      setLogs(prev => [...prev, dmLog]);
    } catch (error) {
      console.error("Transmission Error:", error);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isInitialized) {
    return (
      <div className="relative h-screen w-screen bg-obsidian text-neon-gold flex flex-col items-center justify-center overflow-hidden">
        <div className="crt-overlay"></div>
        <div className="absolute top-0 left-0 p-4 opacity-30 text-[10px] tracking-widest">
            X-COORD_SECTOR: 77.21<br/>
            Y-COORD_SECTOR: 12.04
        </div>

        <header className="mb-20 text-center z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-[0.4em] text-white">INITIALIZING SQUAD...</h1>
          <div className="flex items-center gap-4 mt-6 justify-center">
            <div className="h-px w-24 bg-neon-gold/30"></div>
            <div className="text-[10px] uppercase tracking-[0.5em] text-neon-gold">System: Select Unit Count</div>
            <div className="h-px w-24 bg-neon-gold/30"></div>
          </div>
        </header>

        <div className="flex flex-wrap justify-center gap-8 mb-24 z-10">
          {[1, 2, 3, 4].map(n => (
            <div 
              key={n}
              onClick={() => setUnitCount(n)}
              className={`selection-card group ${unitCount === n ? 'card-selected' : ''}`}
            >
              <div className="absolute top-4 left-4 text-[10px] text-white/20 group-hover:text-[#00F0FF]/40">
                ID: {n === 1 ? 'SOLO_OP' : n === 2 ? 'DUO_LINK' : n === 3 ? 'TRI_SYNC' : 'FULL_SQUAD'}
              </div>
              <span className={`text-7xl font-black mb-8 transition-all duration-300 ${unitCount === n ? 'text-neon-gold' : 'text-white/20 group-hover:text-[#00F0FF]'}`}>{n}</span>
              <div className="size-24 border-2 border-neon-gold/20 rounded-full flex items-center justify-center">
                 <span className="material-symbols-outlined text-4xl opacity-40">group</span>
              </div>
            </div>
          ))}
        </div>

        <footer className="z-10 flex flex-col items-center">
          <button 
            disabled={!unitCount}
            onClick={handleStartMission}
            className={`py-6 px-16 border font-extrabold uppercase tracking-[0.6em] transition-all duration-500 ${unitCount ? 'bg-neon-gold text-obsidian border-neon-gold shadow-[0_0_40px_rgba(255,215,0,0.5)] cursor-pointer' : 'border-white/10 text-white/20 cursor-not-allowed'}`}
          >
            START MISSION
          </button>
          <div className="mt-8 flex items-center justify-center gap-2 text-[9px] uppercase tracking-widest text-neon-gold/40">
            <span className="size-1 bg-neon-gold/20"></span>
            <span>Awaiting selection from terminal...</span>
            <span className="size-1 bg-neon-gold/20"></span>
          </div>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen w-full relative bg-obsidian">
      <div className="crt-overlay"></div>
      
      <header className="h-12 bg-obsidian flex items-center justify-between border-b border-neon-gold/20 px-6 z-50">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-neon-gold text-lg">grid_view</span>
          <h1 className="text-[10px] font-extrabold tracking-[0.3em] uppercase">
            Arcane Tactical Grid <span className="text-neon-gold/40 mx-2">//</span> <span className="text-neon-gold">v1.0.4</span>
          </h1>
        </div>
        <div className="flex items-center gap-6 text-[9px] uppercase tracking-widest text-neon-gold/60">
          <div className="flex items-center gap-2">
            <span className="size-1.5 bg-arcane-green rounded-full animate-pulse"></span>
            <span>Neural Link Stable</span>
          </div>
          <div className="h-4 w-px bg-neon-gold/20"></div>
          <span>Buffer: 99.8%</span>
        </div>
      </header>

      <main className="flex-1 overflow-hidden relative">
        <div className="unified-grid">
          {/* Column 1: Left Stats */}
          <div className="flex flex-col h-full">
            <CharacterSheet stats={MOCK_CHARACTERS[0]} avatarIcon="person_2" />
            <CharacterSheet stats={MOCK_CHARACTERS[2]} avatarIcon="shield" isBottomRow />
          </div>

          {/* Column 2: Narrative Center */}
          <div className="tile-box narrative-tile p-12 flex flex-col items-center justify-center">
            <div className="flex-1 flex flex-col items-center justify-center max-w-lg text-center overflow-hidden">
              <div className="mb-8">
                <div className="size-12 rounded-full border-2 border-neon-gold flex items-center justify-center mb-4 mx-auto">
                  <span className="material-symbols-outlined text-neon-gold">terminal</span>
                </div>
                <h3 className="text-[10px] font-bold text-neon-gold tracking-[0.6em] uppercase">DM Interface : Narrative</h3>
                <div className="flex items-center gap-4 w-48 mt-4 mx-auto">
                  <div className="h-px flex-1 bg-neon-gold/30"></div>
                  <div className="size-1 bg-neon-gold rotate-45"></div>
                  <div className="h-px flex-1 bg-neon-gold/30"></div>
                </div>
              </div>
              
              <div className="relative py-8 px-8 border-y border-neon-gold/10 w-full overflow-y-auto custom-scrollbar flex-1">
                {logs.length > 0 ? (
                  <div className="space-y-6 text-left">
                    {logs.map(log => (
                      <div key={log.id} className={log.role === 'user' ? 'text-right opacity-50' : 'text-left'}>
                         <p className={`text-lg leading-relaxed italic ${log.role === 'dm' ? 'text-white' : 'text-neon-gold'}`}>
                            {log.role === 'user' && '> '}{log.content}
                         </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xl text-white/90 leading-relaxed font-light italic">
                    "The grid initializes. Searching for biological signatures in the archive entry. Waiting for neural command..."
                  </p>
                )}
              </div>
            </div>

            <div className="w-full max-w-sm mt-8">
              <Terminal onSendMessage={handleSendMessage} isThinking={isThinking} isSyncing={isSyncing} />
            </div>
          </div>

          {/* Column 3: Right Stats */}
          <div className="flex flex-col h-full">
            <CharacterSheet stats={MOCK_CHARACTERS[1]} isRightSide themeColor="#FF3131" avatarIcon="auto_awesome" />
            <CharacterSheet stats={MOCK_CHARACTERS[3]} isRightSide isBottomRow avatarIcon="music_note" />
          </div>
        </div>

        <div className="connector-dot top-1/2 left-[31.25%] -translate-x-1/2 -translate-y-1/2"></div>
        <div className="connector-dot top-1/2 left-[68.75%] -translate-x-1/2 -translate-y-1/2"></div>
      </main>

      <footer className="system-pulse">
        <div className="flex items-center gap-4 text-[9px] uppercase tracking-widest text-neon-gold/60 w-full">
          <span className="text-neon-gold font-bold">SYSTEM_LOG &gt;</span>
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            <span className="inline-block animate-[pulse_2s_infinite]">
              {isThinking ? 'Processing Neural Signals... ' : 'Neural Link Stable... '}
              {isSyncing ? 'Accessing Snowflake Compendium... ' : 'Archive Connection Secured... '}
              Location: The Great Archive Entrance...
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[12px]">sensors</span>
            <span>PULSE: 72 BPM</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
