import { describe, it, expect, vi, beforeEach } from "vitest";
import { ontologyRepository } from "../ontologyRepository";

describe("ontologyRepository", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it("should return spells in English by default", async () => {
    const spells = await ontologyRepository.getAll("en");
    const fireball = spells.find((s) => s.index === "fireball");
    expect(fireball?.name).toBe("Fireball");
    expect(fireball?.mechanics?.damage_dice).toBe("8d6");
  });

  it("should return spells in French when requested", async () => {
    const spells = await ontologyRepository.getAll("fr");
    const fireball = spells.find((s) => s.index === "fireball");
    expect(fireball?.name).toBe("Boule de feu");
  });

  it("should filter spells by damage type", async () => {
    const fireSpells = await ontologyRepository.getByDamageType("fire", "en");
    expect(fireSpells.length).toBeGreaterThan(0);
    expect(fireSpells.every((s) => s.mechanics?.damage_type === "fire")).toBe(
      true,
    );
    expect(fireSpells.some((s) => s.index === "fireball")).toBe(true);
  });

  it("should filter spells by saving throw", async () => {
    const dexSaves = await ontologyRepository.getBySaveAbility("dex", "en");
    expect(dexSaves.length).toBeGreaterThan(0);
    expect(dexSaves.every((s) => s.mechanics?.save_ability === "dex")).toBe(
      true,
    );
    expect(dexSaves.some((s) => s.index === "fireball")).toBe(true);
  });

  it("should filter spells by AoE type", async () => {
    const spheres = await ontologyRepository.getByAoEType("sphere", "en");
    expect(spheres.length).toBeGreaterThan(0);
    expect(spheres.some((s) => s.index === "fireball")).toBe(true);
    expect(
      spheres.every((s) => s.mechanics?.area_of_effect?.type === "sphere"),
    ).toBe(true);
  });
});
