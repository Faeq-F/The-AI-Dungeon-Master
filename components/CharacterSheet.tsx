
import React from 'react';
import { CharacterStats } from '../types';

interface CharacterSheetProps {
  stats: CharacterStats;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ stats }) => {
  const hpPercent = (stats.hp / stats.maxHp) * 100;

  return (
    <div className="parchment p-6 rounded-lg shadow-2xl h-full flex flex-col gap-4 overflow-y-auto medieval-font">
      <div className="text-center border-b-2 border-slate-800 pb-2">
        <h2 className="text-3xl font-bold fantasy-font uppercase tracking-wider">{stats.name}</h2>
        <p className="text-lg italic">Level {stats.level} {stats.class}</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Vital Stats */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-sm font-bold mb-1">
              <span>HIT POINTS</span>
              <span>{stats.hp} / {stats.maxHp}</span>
            </div>
            <div className="w-full bg-slate-300 h-4 rounded-full border border-slate-500 overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${hpPercent < 25 ? 'bg-red-600' : hpPercent < 50 ? 'bg-orange-500' : 'bg-green-600'}`}
                style={{ width: `${hpPercent}%` }}
              />
            </div>
          </div>
          <div className="flex justify-around bg-slate-200/50 p-2 border-2 border-slate-400 rounded">
            <div className="text-center">
              <span className="block text-xs font-bold">AC</span>
              <span className="text-2xl font-bold">{stats.ac}</span>
            </div>
            <div className="text-center">
              <span className="block text-xs font-bold">GOLD</span>
              <span className="text-2xl font-bold text-yellow-700">🪙 {stats.gold}</span>
            </div>
          </div>
        </div>

        {/* Abilities */}
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: 'STR', val: stats.str },
            { label: 'DEX', val: stats.dex },
            { label: 'CON', val: stats.con },
            { label: 'INT', val: stats.int },
            { label: 'WIS', val: stats.wis },
            { label: 'CHA', val: stats.cha }
          ].map(attr => (
            <div key={attr.label} className="border-2 border-slate-800 rounded p-1 text-center bg-white/30">
              <span className="text-[10px] font-bold block">{attr.label}</span>
              <span className="text-lg font-bold">{attr.val}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 mt-4">
        <h3 className="text-xl font-bold border-b border-slate-800 mb-2 fantasy-font">INVENTORY</h3>
        <ul className="list-disc list-inside text-sm space-y-1">
          {stats.inventory.map((item, idx) => (
            <li key={idx} className="hover:font-bold transition-all cursor-default">{item}</li>
          ))}
        </ul>
      </div>

      <div className="text-[10px] text-slate-500 italic mt-4 text-center">
        Snowflake Sync Active • Raspberry Pi Edge Agent
      </div>
    </div>
  );
};

export default CharacterSheet;
