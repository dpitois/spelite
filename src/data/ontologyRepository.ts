import type { Spell, SpellMechanics, AbilityScoreIndex } from "../types/dnd";
import { db } from "./db";

/**
 * Reconstructs a Spell object from SPO triplets for a specific subject.
 */
async function reconstructSpell(
  subject: string,
  lang: "en" | "fr",
): Promise<Spell> {
  const triplets = await db.triplets.where("s").equals(subject).toArray();

  const getSingle = (predicate: string) =>
    triplets.find((t) => t.p === predicate)?.o;

  const getLocalized = (predicate: string) => {
    const localized = triplets.find(
      (t) => t.p === predicate && t.lang === lang,
    );
    if (localized) return localized.o;
    // Fallback to English if the requested language is not found
    return triplets.find(
      (t) => t.p === predicate && (t.lang === "en" || !t.lang),
    )?.o;
  };

  const getArray = (predicate: string) =>
    triplets.filter((t) => t.p === predicate).map((t) => t.o as string);

  // Initialize with default values for mandatory properties
  const mechanics: SpellMechanics = {
    has_attack_roll: false,
    has_save: false,
  };

  triplets
    .filter(
      (t) =>
        t.p.startsWith("dnd:") &&
        ![
          "level",
          "school",
          "ritual",
          "concentration",
          "index",
          "components",
          "classes",
          "name",
          "range",
          "duration",
          "casting_time",
          "material",
          "desc",
        ]
          .map((k) => `dnd:${k}`)
          .includes(t.p),
    )
    .forEach((t) => {
      const key = t.p.replace("dnd:", "");

      if (key.startsWith("area_of_effect_")) {
        const subKey = key.replace("area_of_effect_", "");
        if (!mechanics.area_of_effect) {
          mechanics.area_of_effect = { type: "sphere", value: 0, unit: "foot" };
        }
        if (subKey === "type") {
          mechanics.area_of_effect.type = t.o as
            | "sphere"
            | "cone"
            | "cylinder"
            | "line"
            | "cube"
            | "wall";
        }
        if (subKey === "value") {
          mechanics.area_of_effect.value = t.o as number;
        }
        if (subKey === "unit") {
          mechanics.area_of_effect.unit = t.o as "foot" | "mile" | "self";
        }
      } else {
        // Use type assertion carefully for the rest
        (mechanics as unknown as Record<string, unknown>)[key] = t.o;
      }
    });

  return {
    index: getSingle("dnd:index") as string,
    name: getLocalized("dnd:name") as string,
    desc: (getLocalized("dnd:desc") as string)?.split("\n") || [],
    range: getLocalized("dnd:range") as string,
    components: getArray("dnd:components"),
    ritual: getSingle("dnd:ritual") as boolean,
    duration: getLocalized("dnd:duration") as string,
    concentration: getSingle("dnd:concentration") as boolean,
    casting_time: getLocalized("dnd:casting_time") as string,
    level: getSingle("dnd:level") as number,
    damage: mechanics.damage_type
      ? {
          damage_type: {
            index: mechanics.damage_type,
            name: mechanics.damage_type,
          },
        }
      : undefined,
    school: {
      index: getSingle("dnd:school") as string,
      name: getSingle("dnd:school") as string,
    },
    classes: getArray("dnd:classes").map((c) => ({ index: c, name: c })),
    mechanics,
    material: getLocalized("dnd:material") as string | undefined,
  };
}

export const ontologyRepository = {
  /**
   * Returns all spells localized in the given language.
   */
  getAll: async (lang: "en" | "fr" = "en"): Promise<Spell[]> => {
    const allTriplets = await db.triplets
      .where("p")
      .equals("dnd:index")
      .toArray();
    const uniqueSubjects = Array.from(new Set(allTriplets.map((t) => t.s)));

    return Promise.all(uniqueSubjects.map((s) => reconstructSpell(s, lang)));
  },

  /**
   * Finds a specific spell by index.
   */
  getById: async (
    index: string,
    lang: "en" | "fr" = "en",
  ): Promise<Spell | undefined> => {
    const triplet = await db.triplets
      .where("[p+o]")
      .equals(["dnd:index", index])
      .first();

    return triplet ? reconstructSpell(triplet.s, lang) : undefined;
  },

  /**
   * Filters spells by damage type (semantic search).
   */
  getByDamageType: async (
    type: string,
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const triplets = await db.triplets
      .where("[p+o]")
      .equals(["dnd:damage_type", type])
      .toArray();

    return Promise.all(triplets.map((t) => reconstructSpell(t.s, lang)));
  },

  /**
   * Filters spells by saving throw ability.
   */
  getBySaveAbility: async (
    ability: AbilityScoreIndex,
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const triplets = await db.triplets
      .where("[p+o]")
      .equals(["dnd:save_ability", ability])
      .toArray();

    return Promise.all(triplets.map((t) => reconstructSpell(t.s, lang)));
  },

  /**
   * Returns all spells with a specific Area of Effect type.
   */
  getByAoEType: async (
    aoeType: NonNullable<SpellMechanics["area_of_effect"]>["type"],
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const triplets = await db.triplets
      .where("[p+o]")
      .equals(["dnd:area_of_effect_type", aoeType])
      .toArray();

    return Promise.all(triplets.map((t) => reconstructSpell(t.s, lang)));
  },
};
