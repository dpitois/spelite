import type { Spell, SpellMechanics, AbilityScoreIndex } from "../types/dnd";
import { db } from "./db";
import type { SearchQuery } from "../utils/search/queryParser";

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
        // Retransform 1/0 to boolean for boolean fields
        let val = t.o;
        if (
          key === "has_attack_roll" ||
          key === "has_save" ||
          key === "higher_levels"
        ) {
          val = t.o === 1;
        }
        (mechanics as unknown as Record<string, unknown>)[key] = val;
      }
    });

  return {
    index: getSingle("dnd:index") as string,
    name: getLocalized("dnd:name") as string,
    desc: (getLocalized("dnd:desc") as string)?.split("\n") || [],
    range: getLocalized("dnd:range") as string,
    components: getArray("dnd:components"),
    ritual: getSingle("dnd:ritual") === 1,
    duration: getLocalized("dnd:duration") as string,
    concentration: getSingle("dnd:concentration") === 1,
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
   * Advanced semantic search using SearchQuery.
   */
  search: async (
    query: SearchQuery,
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const subjectSets: Set<string>[] = [];

    const {
      level,
      class: classes,
      school,
      damageType,
      saveAbility,
      ritual,
      concentration,
      hasSave,
      hasAttack,
    } = query.filters;

    // Filter by levels
    if (level && level.length > 0) {
      const triplets = await db.triplets
        .where("p")
        .equals("dnd:level")
        .and((t) => level.includes(t.o as number))
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by classes
    if (classes && classes.length > 0) {
      const triplets = await db.triplets
        .where("p")
        .equals("dnd:classes")
        .and((t) => classes.includes(t.o as string))
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by schools
    if (school && school.length > 0) {
      const triplets = await db.triplets
        .where("p")
        .equals("dnd:school")
        .and((t) => school.includes(t.o as string))
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by damage types
    if (damageType && damageType.length > 0) {
      const triplets = await db.triplets
        .where("p")
        .equals("dnd:damage_type")
        .and((t) => damageType.includes(t.o as string))
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by saves
    if (saveAbility && saveAbility.length > 0) {
      const triplets = await db.triplets
        .where("p")
        .equals("dnd:save_ability")
        .and((t) => saveAbility.includes(t.o as AbilityScoreIndex))
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by ritual
    if (ritual !== undefined) {
      const triplets = await db.triplets
        .where("[p+o]")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .equals(["dnd:ritual", ritual ? 1 : 0] as any)
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by concentration
    if (concentration !== undefined) {
      const triplets = await db.triplets
        .where("[p+o]")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .equals(["dnd:concentration", concentration ? 1 : 0] as any)
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by hasSave
    if (hasSave !== undefined) {
      const triplets = await db.triplets
        .where("[p+o]")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .equals(["dnd:has_save", hasSave ? 1 : 0] as any)
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    // Filter by hasAttack
    if (hasAttack !== undefined) {
      const triplets = await db.triplets
        .where("[p+o]")
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .equals(["dnd:has_attack_roll", hasAttack ? 1 : 0] as any)
        .toArray();
      subjectSets.push(new Set(triplets.map((t) => t.s)));
    }

    let finalSubjects: string[];

    if (subjectSets.length === 0) {
      const all = await db.triplets.where("p").equals("dnd:index").toArray();
      finalSubjects = Array.from(new Set(all.map((t) => t.s)));
    } else {
      const firstSet = subjectSets[0];
      finalSubjects = Array.from(firstSet).filter((s) =>
        subjectSets.slice(1).every((set) => set.has(s)),
      );
    }

    // Reconstruct spells
    let spells = await Promise.all(
      finalSubjects.map((s) => reconstructSpell(s, lang)),
    );

    // Final fuzzy/text filtering on name
    if (query.text.trim().length > 0) {
      const searchTerms = query.text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .split(/\s+/)
        .filter((t) => t.length > 0);
      spells = spells.filter((spell) => {
        const normalizedName = spell.name
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
        return searchTerms.every((term) => normalizedName.includes(term));
      });
    }

    return spells.sort((a, b) => a.name.localeCompare(b.name, lang));
  },

  /**
   * Filters spells by damage type (semantic search).
   * @deprecated Use search() instead
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
   * @deprecated Use search() instead
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
   * @deprecated Use search() instead
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
