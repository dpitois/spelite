import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { SpellDatabase } from "../../types/dnd";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("Spell Ontology Data Integrity", () => {
  const dataPath = path.join(__dirname, "../spells.json");
  const db = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as SpellDatabase;

  it("should contain 319 spells", () => {
    expect(db["@graph"]).toHaveLength(319);
  });

  it("should have extracted Acid Splash mechanics correctly", () => {
    const acidSplash = db["@graph"].find((s) => s.index === "acid-splash");
    expect(acidSplash).toBeDefined();
    expect(acidSplash?.mechanics.has_save).toBe(true);
    expect(acidSplash?.mechanics.save_ability).toBe("dex");
    expect(acidSplash?.mechanics.damage_type).toBe("acid");
    expect(acidSplash?.mechanics.damage_dice).toBe("1d6");
  });

  it("should have extracted Fireball mechanics correctly", () => {
    const fireball = db["@graph"].find((s) => s.index === "fireball");
    expect(fireball).toBeDefined();
    expect(fireball?.mechanics.has_save).toBe(true);
    expect(fireball?.mechanics.save_ability).toBe("dex");
    expect(fireball?.mechanics.damage_type).toBe("fire");
    expect(fireball?.mechanics.damage_dice).toBe("8d6");
    expect(fireball?.mechanics.area_of_effect?.type).toBe("sphere");
    expect(fireball?.mechanics.area_of_effect?.value).toBe(20);
    expect(fireball?.mechanics.area_of_effect?.unit).toBe("foot");
  });

  it("should have bilingual support for names", () => {
    const shield = db["@graph"].find((s) => s.index === "shield");
    expect(shield?.name.en).toBe("Shield");
    expect(shield?.name.fr).toBe("Bouclier");
  });

  it("should have correct JSON-LD context", () => {
    expect(db["@context"]).toBeDefined();
    expect(db["@context"].dnd).toBe("https://purl.org/dnd/ontology#");
  });
});
