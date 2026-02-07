import { describe, it, expect } from "vitest";
import { flattenToTriplets } from "../ontologyFlattener";

describe("ontologyFlattener", () => {
  it("should flatten a simple spell to triplets", () => {
    const spell = {
      "@id": "spells:acid-splash",
      index: "acid-splash",
      level: 0,
      school: "conjuration",
      ritual: false,
      components: ["V", "S"],
      name: { en: "Acid Splash", fr: "Aspersion d'acide" },
      mechanics: {
        has_save: true,
        damage_type: "acid",
      },
    };

    const triplets = flattenToTriplets(spell);

    // Basic props (booleans become numbers)
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:index",
      o: "acid-splash",
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:level",
      o: 0,
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:school",
      o: "conjuration",
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:ritual",
      o: 0, // false -> 0
    });

    // Arrays
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:components",
      o: "V",
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:components",
      o: "S",
    });

    // Localized
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:name",
      o: "Acid Splash",
      lang: "en",
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:name",
      o: "Aspersion d'acide",
      lang: "fr",
    });

    // Mechanics
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:has_save",
      o: 1, // true -> 1
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:damage_type",
      o: "acid",
    });
  });

  it("should flatten a class to triplets", () => {
    const classItem = {
      "@id": "classes:wizard",
      index: "wizard",
      hit_die: 6,
      spellcasting_ability: "int",
      name: { en: "Wizard", fr: "Magicien" },
    };

    const triplets = flattenToTriplets(classItem);

    expect(triplets).toContainEqual({
      s: "classes:wizard",
      p: "dnd:index",
      o: "wizard",
    });
    expect(triplets).toContainEqual({
      s: "classes:wizard",
      p: "dnd:hit_die",
      o: 6,
    });
    expect(triplets).toContainEqual({
      s: "classes:wizard",
      p: "dnd:spellcasting_ability",
      o: "int",
    });
    expect(triplets).toContainEqual({
      s: "classes:wizard",
      p: "dnd:name",
      o: "Magicien",
      lang: "fr",
    });
  });

  it("should flatten a race to triplets", () => {
    const raceItem = {
      "@id": "races:human",
      index: "human",
      name: { en: "Human", fr: "Humain" },
    };

    const triplets = flattenToTriplets(raceItem);

    expect(triplets).toContainEqual({
      s: "races:human",
      p: "dnd:index",
      o: "human",
    });
    expect(triplets).toContainEqual({
      s: "races:human",
      p: "dnd:name",
      o: "Humain",
      lang: "fr",
    });
  });

  it("should handle missing properties gracefully", () => {
    const minimalSpell = {
      "@id": "minimal",
      index: "minimal",
    };
    const triplets = flattenToTriplets(minimalSpell);
    expect(triplets.length).toBe(1); // Only 'index' creates a triplet. '@id' is the subject 's'.
  });
});
