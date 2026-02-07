import type {
  AbilityScoreIndex,
  BonusSpellsConfig,
  SubclassConfig,
} from "../types/dnd";

// Standard 5e Spell Slot Table for Full Casters (Bard, Cleric, Druid, Sorcerer, Wizard)
// Index 0 is Level 1, Index 1 is Level 2, etc.
// Each array represents slots for spell levels 1 to 9.
const FULL_CASTER_SLOTS: number[][] = [
  [2], // Level 1
  [3], // Level 2
  [4, 2], // Level 3
  [4, 3], // Level 4
  [4, 3, 2], // Level 5
  [4, 3, 3], // Level 6
  [4, 3, 3, 1], // Level 7
  [4, 3, 3, 2], // Level 8
  [4, 3, 3, 3, 1], // Level 9
  [4, 3, 3, 3, 2], // Level 10
  [4, 3, 3, 3, 2, 1], // Level 11
  [4, 3, 3, 3, 2, 1], // Level 12
  [4, 3, 3, 3, 2, 1, 1], // Level 13
  [4, 3, 3, 3, 2, 1, 1], // Level 14
  [4, 3, 3, 3, 2, 1, 1, 1], // Level 15
  [4, 3, 3, 3, 2, 1, 1, 1], // Level 16
  [4, 3, 3, 3, 2, 1, 1, 1, 1], // Level 17
  [4, 3, 3, 3, 3, 1, 1, 1, 1], // Level 18
  [4, 3, 3, 3, 3, 2, 1, 1, 1], // Level 19
  [4, 3, 3, 3, 3, 2, 2, 1, 1], // Level 20
];

// Warlock Pact Magic Slots
// [Number of Slots, Slot Level]
const WARLOCK_SLOTS: number[][] = [
  [1, 1], // Level 1
  [2, 1], // Level 2
  [2, 2], // Level 3
  [2, 2], // Level 4
  [2, 3], // Level 5
  [2, 3], // Level 6
  [2, 4], // Level 7
  [2, 4], // Level 8
  [2, 5], // Level 9
  [2, 5], // Level 10
  [3, 5], // Level 11 - 16
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [3, 5],
  [4, 5], // Level 17 - 20
  [4, 5],
  [4, 5],
  [4, 5],
];

// Half Casters (Paladin, Ranger)
// Start spellcasting at level 2. Logic is roughly ceil(Level / 2) on the full caster table.
// For simplicity, hardcoding their table here.
const HALF_CASTER_SLOTS: number[][] = [
  [], // Level 1 (No spellcasting)
  [2], // Level 2
  [3], // Level 3
  [3], // Level 4
  [4, 2], // Level 5
  [4, 2], // Level 6
  [4, 3], // Level 7
  [4, 3], // Level 8
  [4, 3, 2], // Level 9
  [4, 3, 2], // Level 10
  [4, 3, 3], // Level 11
  [4, 3, 3], // Level 12
  [4, 3, 3, 1], // Level 13
  [4, 3, 3, 1], // Level 14
  [4, 3, 3, 2], // Level 15
  [4, 3, 3, 2], // Level 16
  [4, 3, 3, 3, 1], // Level 17
  [4, 3, 3, 3, 1], // Level 18
  [4, 3, 3, 3, 2], // Level 19
  [4, 3, 3, 3, 2], // Level 20
];

// Third Casters (Rogue: Arcane Trickster, Fighter: Eldritch Knight)
// Start spellcasting at level 3.
const THIRD_CASTER_SLOTS: number[][] = [
  [], // Level 1
  [], // Level 2
  [2], // Level 3
  [3], // Level 4
  [3], // Level 5
  [3], // Level 6
  [4, 2], // Level 7
  [4, 2], // Level 8
  [4, 2], // Level 9
  [4, 3], // Level 10
  [4, 3], // Level 11
  [4, 3], // Level 12
  [4, 3, 2], // Level 13
  [4, 3, 2], // Level 14
  [4, 3, 2], // Level 15
  [4, 3, 3], // Level 16
  [4, 3, 3], // Level 17
  [4, 3, 3], // Level 18
  [4, 3, 3, 1], // Level 19
  [4, 3, 3, 1], // Level 20
];

export const CASTER_TYPES = {
  FULL: ["bard", "cleric", "druid", "sorcerer", "wizard", "artificer"],
  HALF: ["paladin", "ranger"],
  THIRD: ["arcane trickster", "eldritch knight"],
  WARLOCK: ["warlock"],
  NONE: ["barbarian", "fighter", "monk", "rogue"],
};

export const CLASS_SPELLCASTING_ABILITY: Record<string, AbilityScoreIndex> = {
  wizard: "int",
  artificer: "int",
  cleric: "wis",
  druid: "wis",
  ranger: "wis",
  bard: "cha",
  paladin: "cha",
  sorcerer: "cha",
  warlock: "cha",
  "arcane trickster": "int",
  "eldritch knight": "int",
};

/**
 * Returns the spellcasting ability for a given class/subclass.
 */
export function getSpellcastingAbility(
  className: string,
  subclass: string = "none",
): AbilityScoreIndex {
  const cleanClass = className.toLowerCase();
  const cleanSubclass = subclass.toLowerCase();

  if (CLASS_SPELLCASTING_ABILITY[cleanSubclass])
    return CLASS_SPELLCASTING_ABILITY[cleanSubclass];
  return CLASS_SPELLCASTING_ABILITY[cleanClass] || "int"; // Default to int if unknown
}

/**
 * Classes that have access to their entire spell list for preparation.
 * They don't need to "learn" spells individually.
 */
export const PREPARE_ALL_CLASSES = ["cleric", "druid", "paladin", "artificer"];

export const SUBCLASSES: SubclassConfig = {
  rogue: ["arcane trickster", "assassin", "thief"],
  fighter: ["eldritch knight", "battle master", "champion"],
  cleric: ["life domain", "light domain", "knowledge domain"],
  wizard: ["evocation", "abjuration", "divination"],
};

/**
 * Spells automatically granted by subclasses at specific levels.
 * Key is the subclass index, value is a record of level -> spell indexes.
 */
export const SUBCLASS_BONUS_SPELLS: BonusSpellsConfig = {
  "life domain": {
    1: ["bless", "cure-wounds"],
    3: ["lesser-restoration", "spiritual-weapon"],
    5: ["beacon-of-hope", "revivify"],
    7: ["death-ward", "guardian-of-faith"],
    9: ["mass-cure-wounds", "raise-dead"],
  },
  "light domain": {
    1: ["burning-hands", "faerie-fire"],
    3: ["flaming-sphere", "scorching-ray"],
    5: ["daylight", "fireball"],
    7: ["guardian-of-faith", "wall-of-fire"],
    9: ["flame-strike", "scrying"],
  },
};

/**
 * Returns the list of bonus spell indexes for a given subclass and level.
 */
export function getBonusSpells(subclass: string, level: number): string[] {
  if (!subclass) return [];
  const cleanSubclass = subclass.toLowerCase();
  const bonusData = SUBCLASS_BONUS_SPELLS[cleanSubclass];
  if (!bonusData) return [];

  const spells: string[] = [];
  Object.entries(bonusData).forEach(([lvl, spellList]) => {
    if (level >= parseInt(lvl)) {
      spells.push(...spellList);
    }
  });
  return spells;
}

/**
 * Returns an array of class indexes that this character can draw spells from.
 */
export function getSpellSources(
  className: string,
  subclass: string,
  race: string,
): string[] {
  const sources: string[] = [];
  const cleanClass = (className || "").toLowerCase();
  const cleanSubclass = (subclass || "").toLowerCase();
  const cleanRace = (race || "").toLowerCase();

  // Primary class
  if (
    CASTER_TYPES.FULL.includes(cleanClass) ||
    CASTER_TYPES.HALF.includes(cleanClass) ||
    CASTER_TYPES.WARLOCK.includes(cleanClass)
  ) {
    sources.push(cleanClass);
  }

  // Legacy support for combined class strings
  if (
    cleanClass === "rogue (arcane trickster)" ||
    cleanSubclass === "arcane trickster"
  ) {
    sources.push("wizard");
  }
  if (
    cleanClass === "fighter (eldritch knight)" ||
    cleanSubclass === "eldritch knight"
  ) {
    sources.push("wizard");
  }

  // Racial spells (High Elf and Half-Elf of High Elf lineage get Wizard cantrips)
  if (cleanRace === "high-elf" || cleanRace === "half-elf") {
    sources.push("wizard");
  }

  return Array.from(new Set(sources));
}

/**
 * Calculates available spell slots for a given class and level.
 * @returns Array where index is spell level (0-based, so index 0 is Level 1 spell).
 *          Value is number of slots.
 */
export function calculateSlots(
  className: string,
  level: number,
  subclass: string = "none",
): number[] {
  const cleanClass = className.toLowerCase();
  const cleanSubclass = subclass.toLowerCase();

  if (level < 1 || level > 20) return [];

  if (CASTER_TYPES.FULL.includes(cleanClass)) {
    return FULL_CASTER_SLOTS[level - 1] || [];
  }

  if (CASTER_TYPES.HALF.includes(cleanClass)) {
    return HALF_CASTER_SLOTS[level - 1] || [];
  }

  // Handle Third Casters (subclass based or legacy class name)
  if (
    CASTER_TYPES.THIRD.includes(cleanSubclass) ||
    cleanClass === "rogue (arcane trickster)" ||
    cleanClass === "fighter (eldritch knight)"
  ) {
    return THIRD_CASTER_SLOTS[level - 1] || [];
  }

  if (CASTER_TYPES.WARLOCK.includes(cleanClass)) {
    // Warlock logic is different. They have X slots of level Y.
    // We will represent this as an array with zeros up to the slot level.
    const [count, slotLevel] = WARLOCK_SLOTS[level - 1] || [0, 0];
    if (count === 0) return [];

    // Create array filled with 0s
    const slots = new Array(slotLevel).fill(0);
    // Set the last element (highest level) to the count
    // NOTE: Warlock slots are all of the highest level.
    // But for a generic UI, we might want to show them at that specific level index.
    // e.g. Lv 5 Warlock has 2 slots of 3rd Level. Array: [0, 0, 2]
    slots[slotLevel - 1] = count;
    return slots;
  }

  return [];
}

/**
 * Calculates the maximum number of spells a character can prepare.
 * Rules:
 * - Bard, Ranger, Sorcerer, Warlock: Known spells (fixed number by table) - NOT HANDLED by this function (logic is "Known Spells", not "Prepared").
 * - Cleric, Druid, Paladin: Level + Modifier (minimum 1).
 * - Wizard: Level + Modifier (minimum 1).
 */
export function calculateMaxPrepared(
  className: string,
  level: number,
  modifier: number,
): number {
  const cleanClass = className.toLowerCase();

  // Prepared Casters
  if (["cleric", "druid", "wizard"].includes(cleanClass)) {
    return Math.max(1, level + modifier);
  }

  if (["paladin"].includes(cleanClass)) {
    return Math.max(1, Math.floor(level / 2) + modifier);
  }

  // Known Casters (Fixed list, not prepared daily)
  // For V1, we might just return a high number or handle "Known" separately.
  // Returning -1 to indicate "Not a prepared caster"
  return -1;
}

/**
 * Calculates the modifier for a given ability score.
 */
export function calculateModifier(score: number): number {
  return Math.floor((score - 10) / 2);
}

/**
 * Calculates the proficiency bonus for a given level.
 */
export function calculateProficiency(level: number): number {
  return Math.ceil(level / 4) + 1;
}

/**
 * Calculates the Armor Class (AC).
 * baseAC is usually 10 (unarmored) or the base of the armor worn.
 */
export function calculateAC(dexScore: number, baseAC: number): number {
  return baseAC + calculateModifier(dexScore);
}

/**
 * Calculates the Initiative bonus.
 */
export function calculateInitiative(dexScore: number): number {
  return calculateModifier(dexScore);
}
