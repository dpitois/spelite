import { describe, it, expect } from "vitest";
import { flattenSpellToTriplets } from "../ontologyFlattener";

describe("ontologyFlattener", () => {
  it("should flatten a simple spell to triplets", () => {
    const spell = {
      "@id": "spells:acid-splash",
      level: 0,
      school: "conjuration",
      components: ["V", "S"],
      ritual: false,
      name: {
        en: "Acid Splash",
        fr: "Aspersion d'acide",
      },
      mechanics: {
        has_save: true,
        damage_type: "acid",
      },
    };

    const triplets = flattenSpellToTriplets(spell);

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
      p: "dnd:components",
      o: "V",
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:components",
      o: "S",
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:ritual",
      o: false,
    });
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
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:has_save",
      o: true,
    });
    expect(triplets).toContainEqual({
      s: "spells:acid-splash",
      p: "dnd:damage_type",
      o: "acid",
    });
  });

  it("should handle missing properties gracefully", () => {
    const spell = { "@id": "spells:empty" };
    const triplets = flattenSpellToTriplets(spell);
    expect(triplets).toHaveLength(0); // Only @id is present, but no indexed basic props
  });
});
