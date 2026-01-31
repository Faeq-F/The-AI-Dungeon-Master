
export interface CharacterStats {
  name: string;
  class: string;
  level: number;
  hp: number;
  maxHp: number;
  ac: number;
  gold: number;
  xp: number;
  inventory: string[];
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface GameEntry {
  id: string;
  timestamp: string;
  role: 'user' | 'dm';
  content: string;
  isSnowflakeSynced: boolean;
}

export interface CompendiumEntry {
  name: string;
  type: string;
  hp: number;
  ac: number;
  description: string;
  stats?: Record<string, number>;
}
