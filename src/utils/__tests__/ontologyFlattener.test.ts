import { describe, it, expect } from "vitest";
import { flattenSpellToTriplets } from "../ontologyFlattener";

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

    const triplets = flattenSpellToTriplets(spell);

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

  it("should handle missing properties gracefully", () => {
    const minimalSpell = {
      "@id": "minimal",
      index: "minimal",
    };
    const triplets = flattenSpellToTriplets(minimalSpell);
    expect(triplets.length).toBe(1); // Only 'index' creates a triplet. '@id' is the subject 's'.
  });
});
