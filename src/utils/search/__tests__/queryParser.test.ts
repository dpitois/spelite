import { describe, it, expect } from "vitest";
import { parseQuery } from "../queryParser";

describe("queryParser", () => {
  it("should parse an empty query", () => {
    const result = parseQuery("");
    expect(result.text).toBe("");
    expect(result.filters).toEqual({});
  });

  it("should treat unknown words as search text", () => {
    const result = parseQuery("fireball");
    expect(result.text).toBe("fireball");
    expect(result.filters).toEqual({});
  });

  it("should parse level keywords (EN)", () => {
    const result = parseQuery("cantrip level 3");
    expect(result.filters.level).toContain(0);
    expect(result.filters.level).toContain(3);
    expect(result.text).toBe("");
  });

  it("should parse level keywords (FR)", () => {
    const result = parseQuery("tour de magie niveau 5");
    expect(result.filters.level).toContain(0);
    expect(result.filters.level).toContain(5);
    // "de" and "magie" (if magie not in lexicon)
    expect(result.text).toBe("magie");
  });

  it("should parse class keywords", () => {
    const result = parseQuery("wizard magicien clerc");
    expect(result.filters.class).toContain("wizard");
    expect(result.filters.class).toContain("cleric");
    expect(result.text).toBe("");
  });

  it("should parse damage types", () => {
    const result = parseQuery("fire damage acide");
    expect(result.filters.damageType).toContain("fire");
    expect(result.filters.damageType).toContain("acid");
    expect(result.text).toBe("damage");
  });

  it("should parse traits with negation", () => {
    const result = parseQuery("sans rituel no concentration");
    expect(result.filters.ritual).toBe(false);
    expect(result.filters.concentration).toBe(false);
  });

  it("should parse attack and save prompts with noise words", () => {
    const result = parseQuery("jet d'attaque sans sauvegarde");
    expect(result.filters.hasAttack).toBe(true);
    expect(result.filters.hasSave).toBe(false);
    expect(result.text).toBe("");
  });

  it("should handle accents", () => {
    const result = parseQuery("école évocation");
    expect(result.filters.school).toContain("evocation");
    expect(result.text).toBe("ecole");
  });
});
