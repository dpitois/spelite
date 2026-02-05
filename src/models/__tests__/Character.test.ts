import { describe, it, expect } from "vitest";
import { signal } from "@preact/signals";
import { Character, type CharacterSignals } from "../Character";
import type { CharacterData } from "../../types/dnd";
import type { SpellDictionary } from "../../types/dnd";

const mockData: CharacterData = {
  id: "test-id",
  name: "Test Wizard",
  className: "wizard",
  level: 5,
  stats: { str: 10, dex: 14, con: 12, int: 18, wis: 10, cha: 8 },
  hp: { current: 30, max: 30, temp: 0 },
  baseAC: 10,
  knownSpells: ["fireball", "magic-missile", "mage-armor", "prestidigitation"],
  preparedSpells: ["fireball", "mage-armor"],
  usedSlots: {},
  subclass: "",
  race: "human",
  updatedAt: Date.now(),
};

const mockSpellDetails: SpellDictionary = {
  fireball: {
    index: "fireball",
    name: "Fireball",
    level: 3,
    desc: [],
    range: "",
    components: [],
    duration: "",
    casting_time: "",
    school: { index: "evocation", name: "Evocation", url: "" },
    classes: [],
    ritual: false,
    concentration: false,
  },
  "magic-missile": {
    index: "magic-missile",
    name: "Magic Missile",
    level: 1,
    desc: [],
    range: "",
    components: [],
    duration: "",
    casting_time: "",
    school: { index: "evocation", name: "Evocation", url: "" },
    classes: [],
    ritual: false,
    concentration: false,
  },
  "mage-armor": {
    index: "mage-armor",
    name: "Mage Armor",
    level: 1,
    desc: [],
    range: "",
    components: [],
    duration: "",
    casting_time: "",
    school: { index: "abjuration", name: "Abjuration", url: "" },
    classes: [],
    ritual: false,
    concentration: false,
  },
  prestidigitation: {
    index: "prestidigitation",
    name: "Prestidigitation",
    level: 0,
    desc: [],
    range: "",
    components: [],
    duration: "",
    casting_time: "",
    school: { index: "transmutation", name: "Transmutation", url: "" },
    classes: [],
    ritual: false,
    concentration: false,
  },
  bless: {
    index: "bless",
    name: "Bless",
    level: 1,
    desc: [],
    range: "",
    components: [],
    duration: "",
    casting_time: "",
    school: { index: "enchantment", name: "Enchantment", url: "" },
    classes: [],
    ritual: false,
    concentration: true,
  },
};

// Helper to create a reactive Character from static data
function createTestChar(data: CharacterData) {
  const signals: CharacterSignals = {
    id: signal(data.id),
    name: signal(data.name),
    className: signal(data.className),
    subclass: signal(data.subclass),
    race: signal(data.race),
    level: signal(data.level),
    stats: signal(data.stats),
    hp: signal(data.hp),
    baseAC: signal(data.baseAC),
    knownSpells: signal(data.knownSpells),
    preparedSpells: signal(data.preparedSpells),
    usedSlots: signal(data.usedSlots),
  };
  return new Character(signals);
}

describe("Character Model", () => {
  it("calculates proficiency bonus correctly based on level", () => {
    const char = createTestChar(mockData);
    expect(char.proficiencyBonus).toBe(3); // Level 5 is +3
  });

  it("calculates spell save DC correctly", () => {
    const char = createTestChar(mockData);
    // 8 + 3 (prof) + 4 (int mod) = 15
    expect(char.spellSaveDC).toBe(15);
  });

  it("calculates initiative correctly", () => {
    const char = createTestChar(mockData);
    expect(char.initiative).toBe(2); // Dex 14 is +2
  });

  it("identifies max prepared spells limit", () => {
    const char = createTestChar(mockData);
    // Level 5 + 4 (int mod) = 9
    expect(char.maxPreparedSpells).toBe(9);
  });

  it("manages prepared spells list including cantrips", () => {
    const char = createTestChar(mockData);
    const preparedList = char.getPreparedSpellsList(mockSpellDetails);

    // Should include manual preparations (Fireball, Mage Armor)
    // AND all known cantrips (Prestidigitation)
    expect(preparedList.map((s) => s.index)).toContain("fireball");
    expect(preparedList.map((s) => s.index)).toContain("mage-armor");
    expect(preparedList.map((s) => s.index)).toContain("prestidigitation");
    expect(preparedList).toHaveLength(3);
  });

  it("calculates manual prepared count correctly (excluding cantrips)", () => {
    const char = createTestChar(mockData);
    // Prepared are fireball (lvl 3) and mage-armor (lvl 1). Total 2.
    expect(char.getManualPreparedCount(mockSpellDetails)).toBe(2);
  });

  it("includes bonus subclass spells in prepared list", () => {
    const clericData = {
      ...mockData,
      className: "cleric",
      subclass: "life domain",
      preparedSpells: [],
    };
    const char = createTestChar(clericData);
    const preparedList = char.getPreparedSpellsList(mockSpellDetails);

    // Life domain Lvl 5 should have Bless automatically
    expect(preparedList.map((s) => s.index)).toContain("bless");
  });

  it("updates HP correctly within bounds", () => {
    const char = createTestChar(mockData);

    char.updateHP(25);
    expect(char.hp.current).toBe(25);
    // Also verify signal updated
    expect(char.$.hp.value.current).toBe(25);

    char.updateHP(50); // Above max (30)
    expect(char.hp.current).toBe(30);

    char.updateHP(-10); // Below 0
    expect(char.hp.current).toBe(0);
  });
});
