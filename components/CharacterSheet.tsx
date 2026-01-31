
import React from 'react';
import { CharacterStats } from '../types';

interface CharacterSheetProps {
  stats: CharacterStats;
  isRightSide?: boolean;
  isBottomRow?: boolean;
  avatarIcon?: string;
  themeColor?: string;
  subLabel?: string;
}

const CharacterSheet: React.FC<CharacterSheetProps> = ({ 
  stats, 
  isRightSide = false, 
  isBottomRow = false,
  avatarIcon = 'person',
  themeColor = '#00FF95',
  subLabel = 'Specialist • Lvl 12'
}) => {
  const hpPercent = (stats.hp / stats.maxHp) * 100;
  const dashOffset = 283 - (283 * hpPercent) / 100;

  return (
    <div className={`tile-box p-8 ${isRightSide ? 'items-end text-right border-l-0' : 'border-r-0'} ${isBottomRow ? 'border-t-0' : 'border-b-0'}`}>
      <div className={`flex gap-6 items-center mb-8 ${isRightSide ? 'flex-row-reverse' : ''}`}>
        <div className="vital-orb">
          <svg className="orb-svg" viewBox="0 0 100 100">
            <circle cx="50" cy="50" fill="none" r="45" stroke="rgba(255,255,255,0.05)" strokeWidth="4"></circle>
            <circle 
              cx="50" cy="50" fill="none" r="45" 
              stroke={themeColor} 
              strokeDasharray="283" 
              strokeDashoffset={dashOffset} 
              strokeWidth="4"
              className="transition-all duration-1000"
            ></circle>
          </svg>
          <div className="size-16 rounded-full overflow-hidden border border-neon-gold/20 bg-cyber-slate flex items-center justify-center">
            <span className="material-symbols-outlined text-neon-gold text-4xl">{avatarIcon}</span>
          </div>
        </div>
        <div>
          <h2 className="text-2xl font-extrabold tracking-tighter uppercase">{stats.name}</h2>
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `${themeColor}CC` }}>{stats.class} • Lvl {stats.level}</p>
          <div className={`flex gap-1 mt-2 ${isRightSide ? 'justify-end' : ''}`}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} className={`pip ${i <= stats.level % 4 + 1 ? 'pip-active' : 'pip-inactive'}`}></div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-6 w-full">
        {stats.inventory.slice(0, 4).map((item, idx) => (
          <div key={idx} className={`glass-badge ${isRightSide ? 'justify-end' : ''}`}>
            {idx === 0 ? '⚔️' : idx === 1 ? '🧪' : idx === 2 ? '🕵️' : '💾'} {item}
          </div>
        ))}
      </div>

      <div className="mt-auto pt-4 border-t border-neon-gold/10 w-full">
        <div className={`flex justify-between text-[10px] uppercase mb-1 ${isRightSide ? 'flex-row-reverse' : ''}`}>
          <span>{isBottomRow ? 'Shield Integrity' : 'Sync-Rate'}</span>
          <span>{Math.round(hpPercent)}%</span>
        </div>
        <div className="h-1 w-full bg-white/5">
          <div 
            className={`h-full ${isRightSide ? 'float-right' : ''}`} 
            style={{ width: `${hpPercent}%`, backgroundColor: themeColor }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default CharacterSheet;
