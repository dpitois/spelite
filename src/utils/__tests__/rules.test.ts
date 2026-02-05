import { describe, it, expect } from "vitest";
import * as rules from "../rules";

describe("D&D Rules Engine", () => {
  describe("calculateModifier", () => {
    it("calculates positive modifiers correctly", () => {
      expect(rules.calculateModifier(10)).toBe(0);
      expect(rules.calculateModifier(12)).toBe(1);
      expect(rules.calculateModifier(18)).toBe(4);
      expect(rules.calculateModifier(20)).toBe(5);
    });

    it("calculates negative modifiers correctly", () => {
      expect(rules.calculateModifier(8)).toBe(-1);
      expect(rules.calculateModifier(5)).toBe(-3);
      expect(rules.calculateModifier(1)).toBe(-5);
    });
  });

  describe("calculateProficiency", () => {
    it("returns correct proficiency bonus for various levels", () => {
      expect(rules.calculateProficiency(1)).toBe(2);
      expect(rules.calculateProficiency(4)).toBe(2);
      expect(rules.calculateProficiency(5)).toBe(3);
      expect(rules.calculateProficiency(9)).toBe(4);
      expect(rules.calculateProficiency(13)).toBe(5);
      expect(rules.calculateProficiency(17)).toBe(6);
      expect(rules.calculateProficiency(20)).toBe(6);
    });
  });

  describe("calculateSlots", () => {
    it("calculates slots for full casters (Wizard)", () => {
      expect(rules.calculateSlots("wizard", 1)).toEqual([2]);
      expect(rules.calculateSlots("wizard", 3)).toEqual([4, 2]);
      expect(rules.calculateSlots("wizard", 5)).toEqual([4, 3, 2]);
    });

    it("calculates slots for half casters (Paladin)", () => {
      expect(rules.calculateSlots("paladin", 1)).toEqual([]);
      expect(rules.calculateSlots("paladin", 2)).toEqual([2]);
      expect(rules.calculateSlots("paladin", 5)).toEqual([4, 2]);
    });

    it("calculates slots for Warlocks", () => {
      // Warlocks have 2 slots of level 1 at Lvl 2
      expect(rules.calculateSlots("warlock", 2)).toEqual([2]);
      // Warlocks have 2 slots of level 3 at Lvl 5
      expect(rules.calculateSlots("warlock", 5)).toEqual([0, 0, 2]);
    });

    it("returns empty for non-casters", () => {
      expect(rules.calculateSlots("barbarian", 5)).toEqual([]);
    });
  });

  describe("getBonusSpells", () => {
    it("returns bonus spells for Life Domain Cleric", () => {
      const spellsLvl1 = rules.getBonusSpells("life domain", 1);
      expect(spellsLvl1).toContain("bless");
      expect(spellsLvl1).toContain("cure-wounds");

      const spellsLvl3 = rules.getBonusSpells("life domain", 3);
      expect(spellsLvl3).toHaveLength(4);
      expect(spellsLvl3).toContain("spiritual-weapon");
    });

    it("returns empty for unknown subclass", () => {
      expect(rules.getBonusSpells("unknown", 5)).toEqual([]);
    });
  });

  describe("getSpellSources", () => {
    it("identifies sources for Arcane Trickster", () => {
      const sources = rules.getSpellSources(
        "rogue",
        "arcane trickster",
        "human",
      );
      // Rogue doesn't have its own spell list, it uses Wizard list
      expect(sources).not.toContain("rogue");
      expect(sources).toContain("wizard");
    });

    it("identifies racial sources for High-Elf", () => {
      const sources = rules.getSpellSources("fighter", "champion", "high-elf");
      expect(sources).toContain("wizard"); // High elves get wizard cantrips
    });
  });
});
