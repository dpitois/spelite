import { describe, it, expect } from "vitest";
import type { RawSpell, SpellDatabase } from "../dnd";

describe("D&D Ontology Types", () => {
  it("should allow creating a RawSpell object with JSON-LD properties", () => {
    const spell: RawSpell = {
      "@id": "spells:acid-splash",
      "@type": "dnd:Spell",
      index: "acid-splash",
      level: 0,
      school: "conjuration",
      components: ["V", "S"],
      ritual: false,
      concentration: false,
      classes: ["sorcerer", "wizard"],
      mechanics: {
        has_attack_roll: false,
        has_save: true,
        save_ability: "dex",
        damage_type: "acid",
      },
      name: { en: "Acid Splash", fr: "Aspersion d'acide" },
      desc: {
        en: ["A bubble of acid is hurled..."],
        fr: ["Vous projetez une bulle d'acide..."],
      },
      range: { en: "60 feet", fr: "18 mètres" },
      duration: { en: "Instantaneous", fr: "Instantanée" },
      casting_time: { en: "1 action", fr: "1 action" },
      material: { en: null, fr: null },
    };

    expect(spell.index).toBe("acid-splash");
    expect(spell.mechanics.save_ability).toBe("dex");
  });

  it("should allow creating a SpellDatabase wrapper", () => {
    const db: SpellDatabase = {
      "@context": {
        dnd: "https://purl.org/dnd/ontology#",
        spells: "https://purl.org/dnd/spells/",
      },
      "@graph": [],
    };
    expect(db["@graph"]).toHaveLength(0);
  });
});
