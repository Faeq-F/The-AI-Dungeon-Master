
import React, { useEffect, useRef } from 'react';
import { GameEntry } from '../types';

interface GameLogProps {
  logs: GameEntry[];
}

const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const logEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="bg-black/80 border-2 border-emerald-900/50 rounded-lg p-4 flex-1 overflow-y-auto flex flex-col gap-4 custom-scrollbar">
      {logs.length === 0 && (
        <div className="text-emerald-500/30 italic text-center mt-10">
          The adventure begins... Type "start game" to begin your journey.
        </div>
      )}
      {logs.map((log) => (
        <div 
          key={log.id} 
          className={`flex flex-col gap-1 ${log.role === 'user' ? 'items-end' : 'items-start'}`}
        >
          <div className="flex items-center gap-2 text-[10px] opacity-40">
            {log.role === 'dm' ? (
              <span className="text-emerald-400 font-bold uppercase tracking-widest">Dungeon Master</span>
            ) : (
              <span className="text-blue-400 font-bold uppercase tracking-widest">Player</span>
            )}
            <span>{log.timestamp}</span>
            {log.isSnowflakeSynced && <i className="fa-solid fa-cloud-check text-emerald-500" title="Synced to Snowflake"></i>}
          </div>
          <div className={`max-w-[85%] p-3 rounded-lg text-sm leading-relaxed ${
            log.role === 'user' 
              ? 'bg-blue-900/20 text-blue-100 border border-blue-800/50 rounded-tr-none' 
              : 'bg-emerald-950/20 text-emerald-100 border border-emerald-900/50 rounded-tl-none glow-text'
          }`}>
            {log.content}
          </div>
        </div>
      ))}
      <div ref={logEndRef} />
    </div>
  );
};

export default GameLog;
