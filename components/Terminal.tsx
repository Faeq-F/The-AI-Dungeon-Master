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
    <div className="w-full">
      <form onSubmit={handleSubmit} className="relative flex flex-col gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isThinking}
          placeholder={isThinking ? "DM PROCESSING..." : "Neural Input Request..."}
          className="w-full bg-black/40 border border-neon-gold/20 py-4 px-6 focus:outline-none focus:border-neon-gold text-neon-gold placeholder:text-neon-gold/20 font-mono tracking-widest uppercase text-xs"
        />
        <button
          type="submit"
          disabled={isThinking || !input.trim()}
          className="btn-initiate w-full flex items-center justify-center gap-4"
        >
          {isThinking ? (
            <>
              <i className="fa-solid fa-spinner fa-spin"></i>
              <span>Neural Processing</span>
            </>
          ) : (
            <span>Initiate Dialogue</span>
          )}
        </button>
      </form>
      <div className="mt-6 flex justify-center gap-3">
        <div className={`size-1 ${isThinking ? 'bg-arcane-green animate-pulse' : 'bg-neon-gold'}`}></div>
        <div className={`size-1 ${isSyncing ? 'bg-blue-400 animate-bounce' : 'bg-neon-gold/20'}`}></div>
        <div className="size-1 bg-neon-gold/20"></div>
      </div>
    </div>
  );
};

export default Terminal;
