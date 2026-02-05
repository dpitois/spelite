export interface APIReference {
  index: string;
  name: string;
  url: string;
}

export interface Spell {
  index: string;
  name: string;
  level: number;
  desc: string[];
  range: string;
  components: string[];
  material?: string;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  school: APIReference;
  classes: APIReference[];
  subclasses?: APIReference[];
  url?: string;
}

export type SpellDictionary = Record<string, Spell>;
export type UsedSlotsState = Record<number, number>;
export type BonusSpellsConfig = Record<string, Record<number, string[]>>;
export type SubclassConfig = Record<string, string[]>;
export type SpellCache = Record<string, Spell[]>;

export interface Class {
  index: string;
  name: string;
  hit_die: number;
  spellcasting?: {
    level: number;
    spellcasting_ability: APIReference;
    info: { name: string; desc: string[] }[];
  };
}

export type AbilityScoreIndex = "str" | "dex" | "con" | "int" | "wis" | "cha";

export interface AbilityScores extends Record<AbilityScoreIndex, number> {
  str: number;
  dex: number;
  con: number;
  int: number;
  wis: number;
  cha: number;
}

export interface HPState {
  current: number;
  max: number;
  temp: number;
}

export interface CharacterState {
  name: string;
  className: string;
  subclass: string;
  race: string;
  level: number;
  stats: AbilityScores;
  hp: HPState;
  baseAC: number;
  knownSpells: string[];
  preparedSpells: string[];
  usedSlots: UsedSlotsState;
}

export interface CharacterData extends CharacterState {
  id: string;
  updatedAt: number;
}

export type Translation = {
  common: Record<string, string>;
  dashboard: Record<string, string>;
  setup: Record<string, string>;
  spells: Record<string, string>;
  layout: Record<string, string>;
  pwa: Record<string, string>;
  grimoire: Record<string, string>;
  classes: Record<string, string>;
  races: Record<string, string>;
};

export type TranslationDictionary = Record<string, Translation>;
