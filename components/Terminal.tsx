
import React, { useState } from 'react';

interface TerminalProps {
  onSendMessage: (msg: string) => void;
  isThinking: boolean;
  isSyncing: boolean;
}

const Terminal: React.FC<TerminalProps> = ({ onSendMessage, isThinking, isSyncing }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isThinking) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  return (
    <div className="bg-zinc-900 border-t border-emerald-900/50 p-4 sticky bottom-0 z-10">
      <div className="flex items-center gap-3 mb-2 h-6">
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-emerald-500 crt-flicker">
            <i className="fa-solid fa-spinner fa-spin"></i>
            <span>DM IS THINKING...</span>
          </div>
        )}
        {isSyncing && (
          <div className="flex items-center gap-2 text-xs text-blue-400 animate-pulse ml-auto">
            <i className="fa-solid fa-database"></i>
            <span>QUERYING SNOWFLAKE...</span>
          </div>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="relative">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500 font-bold">{'>'}</span>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
          placeholder={isThinking ? "Wait for the Master..." : "Speak your action, adventurer..."}
          className="w-full bg-black/50 border-2 border-emerald-900/30 rounded-full py-3 pl-10 pr-12 focus:outline-none focus:border-emerald-500/50 text-emerald-100 placeholder:text-emerald-900 transition-all"
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="absolute right-3 top-1/2 -translate-y-1/2 bg-emerald-700 hover:bg-emerald-600 disabled:bg-zinc-800 disabled:text-zinc-600 w-8 h-8 rounded-full flex items-center justify-center transition-colors"
        >
          <i className="fa-solid fa-arrow-up"></i>
        </button>
      </form>
      <div className="mt-2 text-[10px] text-zinc-600 text-center uppercase tracking-widest font-bold">
        Pi-Powered Dungeon Interface v2.5.0
      </div>
    </div>
  );
};

export default Terminal;
