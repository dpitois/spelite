import { describe, it, expect, vi, beforeEach } from "vitest";
import { ontologyRepository } from "../ontologyRepository";
import { initializeDatabase } from "../dbInitializer";
import { parseQuery } from "../../utils/search/queryParser";
import { db } from "../db";

describe("ontologyRepository", () => {
  beforeEach(async () => {
    vi.resetModules();
    // Clear the database completely between tests to avoid pollution
    await db.triplets.clear();
    await initializeDatabase();
  });

  // Helper to search using natural language string
  const nlSearch = (input: string, lang: "en" | "fr" = "en") =>
    ontologyRepository.search(parseQuery(input), lang);

  it("should return spells in English by default", async () => {
    const spells = await ontologyRepository.getAll("en");
    const fireball = spells.find((s) => s.index === "fireball");
    expect(fireball?.name).toBe("Fireball");
  });

  describe("Semantic Search (10 Validation Examples)", () => {
    it("1. wizard level 3", async () => {
      const spells = await nlSearch("wizard level 3");
      expect(spells.length).toBeGreaterThan(0);
      expect(
        spells.every(
          (s) => s.level === 3 && s.classes.some((c) => c.index === "wizard"),
        ),
      ).toBe(true);
    }, 15000);

    it("2. tour (FR)", async () => {
      const spells = await nlSearch("tour", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(spells.every((s) => s.level === 0)).toBe(true);
    }, 15000);

    it("3. magicien", async () => {
      const spells = await nlSearch("magicien", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(
        spells.every((s) => s.classes.some((c) => c.index === "wizard")),
      ).toBe(true);
    }, 15000);

    it("4. evocation", async () => {
      const spells = await nlSearch("evocation");
      expect(spells.length).toBeGreaterThan(0);
      expect(spells.every((s) => s.school.index === "evocation")).toBe(true);
    }, 15000);

    it("5. rituel", async () => {
      const spells = await nlSearch("rituel", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(spells.every((s) => s.ritual)).toBe(true);
    }, 15000);

    it("6. sorcier", async () => {
      const spells = await nlSearch("sorcier", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(
        spells.every((s) => s.classes.some((c) => c.index === "sorcerer")),
      ).toBe(true);
    }, 15000);

    it("7. foudre", async () => {
      const spells = await nlSearch("foudre", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(
        spells.every((s) => s.mechanics?.damage_type === "lightning"),
      ).toBe(true);
    }, 15000);

    it("8. jet attaque", async () => {
      const spells = await nlSearch("jet attaque", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(spells.every((s) => s.mechanics?.has_attack_roll)).toBe(true);
    }, 15000);

    it("9. sauvegarde dexterite", async () => {
      const spells = await nlSearch("sauvegarde dexterite", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(spells.every((s) => s.mechanics?.save_ability === "dex")).toBe(
        true,
      );
    }, 15000);

    it("10. sans sauvegarde", async () => {
      const spells = await nlSearch("sans sauvegarde", "fr");
      expect(spells.length).toBeGreaterThan(0);
      expect(spells.every((s) => s.mechanics?.has_save === false)).toBe(true);
    }, 15000);
  });
});
