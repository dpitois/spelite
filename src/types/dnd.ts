export interface APIReference {
  index: string;
  name: string;
  url?: string;
}

export interface SpellMechanics {
  has_attack_roll: boolean;
  attack_type?: "melee" | "ranged";
  has_save: boolean;
  save_ability?: AbilityScoreIndex;
  damage_type?: string;
  damage_dice?: string;
  condition_inflicted?: string;
  area_of_effect?: {
    type: "sphere" | "cone" | "cylinder" | "line" | "cube" | "wall";
    value: number;
    unit: "foot" | "mile" | "self";
  };
  higher_levels?: boolean;
}

export interface Spell {
  index: string;
  name: string;
  level: number;
  desc: string[];
  range: string;
  components: string[];
  material?: string | null;
  ritual: boolean;
  duration: string;
  concentration: boolean;
  casting_time: string;
  school: APIReference;
  classes: APIReference[];
  subclasses?: APIReference[];
  url?: string;
  damage?: {
    damage_type: APIReference;
  };
  mechanics?: SpellMechanics;
}

/**
 * Represents the localized strings for a spell property.
 */
export type LocalizedString = Record<string, string>;
export type LocalizedStringArray = Record<string, string[]>;

/**
 * The storage format for spells in the unique spells.json (JSON-LD compatible).
 */
export interface RawSpell {
  "@id": string;
  "@type": "dnd:Spell";
  index: string;
  level: number;
  school: string;
  components: string[];
  ritual: boolean;
  concentration: boolean;
  classes: string[];
  mechanics: SpellMechanics;
  name: LocalizedString;
  desc: LocalizedStringArray;
  range: LocalizedString;
  duration: LocalizedString;
  casting_time: LocalizedString;
  material: Record<string, string | null>;
}

/**
 * The root structure of the ontology JSON file.
 */
export interface SpellDatabase {
  "@context": Record<string, unknown>;
  "@graph": RawSpell[];
}

export type SpellDictionary = Record<string, Spell>;
export type UsedSlotsState = Record<number, number>;
export type BonusSpellsConfig = Record<string, Record<number, string[]>>;
export type SubclassConfig = Record<string, string[]>;

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
  mechanics: {
    damageTypes: Record<string, string>;
    abilities: Record<string, string>;
    allTypes: string;
    allAbilities: string;
    damageLabel: string;
    saveLabel: string;
  };
};

export type TranslationDictionary = Record<string, Translation>;
