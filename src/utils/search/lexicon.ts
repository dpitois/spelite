import type { AbilityScoreIndex } from "../../types/dnd";

export type SearchFilterType =
  | "LEVEL"
  | "SCHOOL"
  | "CLASS"
  | "DAMAGE"
  | "SAVE"
  | "RITUAL"
  | "CONCENTRATION"
  | "NEGATION"
  | "SAVE_PROMPT"
  | "ATTACK_PROMPT"
  | "NOISE";

export interface LexiconEntry {
  type: SearchFilterType;
  value: string | number | boolean;
}

export const LEXICON: Record<string, LexiconEntry> = {
  // Noise words (ignored)
  de: { type: "NOISE", value: "" },
  d: { type: "NOISE", value: "" },
  le: { type: "NOISE", value: "" },
  la: { type: "NOISE", value: "" },
  les: { type: "NOISE", value: "" },
  des: { type: "NOISE", value: "" },
  du: { type: "NOISE", value: "" },

  // Levels
  "0": { type: "LEVEL", value: 0 },
  "1": { type: "LEVEL", value: 1 },
  "2": { type: "LEVEL", value: 2 },
  "3": { type: "LEVEL", value: 3 },
  "4": { type: "LEVEL", value: 4 },
  "5": { type: "LEVEL", value: 5 },
  "6": { type: "LEVEL", value: 6 },
  "7": { type: "LEVEL", value: 7 },
  "8": { type: "LEVEL", value: 8 },
  "9": { type: "LEVEL", value: 9 },
  cantrip: { type: "LEVEL", value: 0 },
  tour: { type: "LEVEL", value: 0 },
  niveau: { type: "LEVEL", value: -1 },
  level: { type: "LEVEL", value: -1 },
  lvl: { type: "LEVEL", value: -1 },

  // Schools
  abjuration: { type: "SCHOOL", value: "abjuration" },
  conjuration: { type: "SCHOOL", value: "conjuration" },
  divination: { type: "SCHOOL", value: "divination" },
  enchantment: { type: "SCHOOL", value: "enchantment" },
  enchantement: { type: "SCHOOL", value: "enchantment" },
  evocation: { type: "SCHOOL", value: "evocation" },
  illusion: { type: "SCHOOL", value: "illusion" },
  necromancy: { type: "SCHOOL", value: "necromancy" },
  necromancie: { type: "SCHOOL", value: "necromancy" },
  transmutation: { type: "SCHOOL", value: "transmutation" },

  // Classes
  barbarian: { type: "CLASS", value: "barbarian" },
  barbare: { type: "CLASS", value: "barbarian" },
  bard: { type: "CLASS", value: "bard" },
  barde: { type: "CLASS", value: "bard" },
  cleric: { type: "CLASS", value: "cleric" },
  clerc: { type: "CLASS", value: "cleric" },
  druid: { type: "CLASS", value: "druid" },
  druide: { type: "CLASS", value: "druid" },
  fighter: { type: "CLASS", value: "fighter" },
  guerrier: { type: "CLASS", value: "fighter" },
  monk: { type: "CLASS", value: "monk" },
  moine: { type: "CLASS", value: "monk" },
  paladin: { type: "CLASS", value: "paladin" },
  ranger: { type: "CLASS", value: "ranger" },
  rodeur: { type: "CLASS", value: "ranger" },
  rogue: { type: "CLASS", value: "rogue" },
  roublard: { type: "CLASS", value: "rogue" },
  sorcerer: { type: "CLASS", value: "sorcerer" },
  ensorceleur: { type: "CLASS", value: "sorcerer" },
  sorcier: { type: "CLASS", value: "sorcerer" },
  warlock: { type: "CLASS", value: "warlock" },
  occultiste: { type: "CLASS", value: "warlock" },
  wizard: { type: "CLASS", value: "wizard" },
  magicien: { type: "CLASS", value: "wizard" },
  mage: { type: "CLASS", value: "wizard" },

  // Damage types
  acid: { type: "DAMAGE", value: "acid" },
  acide: { type: "DAMAGE", value: "acid" },
  bludgeoning: { type: "DAMAGE", value: "bludgeoning" },
  contondant: { type: "DAMAGE", value: "bludgeoning" },
  cold: { type: "DAMAGE", value: "cold" },
  froid: { type: "DAMAGE", value: "cold" },
  fire: { type: "DAMAGE", value: "fire" },
  feu: { type: "DAMAGE", value: "fire" },
  force: { type: "DAMAGE", value: "force" },
  lightning: { type: "DAMAGE", value: "lightning" },
  foudre: { type: "DAMAGE", value: "lightning" },
  necrotic: { type: "DAMAGE", value: "necrotic" },
  necrotique: { type: "DAMAGE", value: "necrotic" },
  piercing: { type: "DAMAGE", value: "piercing" },
  perforant: { type: "DAMAGE", value: "piercing" },
  poison: { type: "DAMAGE", value: "poison" },
  psychic: { type: "DAMAGE", value: "psychic" },
  psychique: { type: "DAMAGE", value: "psychic" },
  radiant: { type: "DAMAGE", value: "radiant" },
  slashing: { type: "DAMAGE", value: "slashing" },
  tranchant: { type: "DAMAGE", value: "slashing" },
  thunder: { type: "DAMAGE", value: "thunder" },
  tonnerre: { type: "DAMAGE", value: "thunder" },

  // Saves
  str: { type: "SAVE", value: "str" as AbilityScoreIndex },
  dex: { type: "SAVE", value: "dex" as AbilityScoreIndex },
  dexterite: { type: "SAVE", value: "dex" as AbilityScoreIndex },
  con: { type: "SAVE", value: "con" as AbilityScoreIndex },
  constitution: { type: "SAVE", value: "con" as AbilityScoreIndex },
  int: { type: "SAVE", value: "int" as AbilityScoreIndex },
  intelligence: { type: "SAVE", value: "int" as AbilityScoreIndex },
  wis: { type: "SAVE", value: "wis" as AbilityScoreIndex },
  sagesse: { type: "SAVE", value: "wis" as AbilityScoreIndex },
  cha: { type: "SAVE", value: "cha" as AbilityScoreIndex },
  charisme: { type: "SAVE", value: "cha" as AbilityScoreIndex },

  // Traits
  ritual: { type: "RITUAL", value: true },
  rituel: { type: "RITUAL", value: true },
  concentration: { type: "CONCENTRATION", value: true },
  conc: { type: "CONCENTRATION", value: true },

  // Negation
  sans: { type: "NEGATION", value: true },
  no: { type: "NEGATION", value: true },

  // Prompts
  sauvegarde: { type: "SAVE_PROMPT", value: true },
  save: { type: "SAVE_PROMPT", value: true },
  jet: { type: "SAVE_PROMPT", value: true },
  attaque: { type: "ATTACK_PROMPT", value: true },
  attack: { type: "ATTACK_PROMPT", value: true },
};
