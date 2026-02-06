import type {
  Spell,
  SpellDatabase,
  SpellMechanics,
  AbilityScoreIndex,
  RawSpell,
} from "../types/dnd";

let cachedDb: SpellDatabase | null = null;

/**
 * Loads the master ontology database.
 */
async function loadDb(): Promise<SpellDatabase> {
  if (cachedDb) return cachedDb;

  // Dynamic import for code splitting
  const data = await import("./spells.json");
  cachedDb = data.default as SpellDatabase;
  return cachedDb;
}

/**
 * Maps a raw ontology spell to a localized Spell object.
 */
function mapToLanguage(raw: RawSpell, lang: "en" | "fr"): Spell {
  return {
    index: raw.index,
    name: raw.name[lang] || raw.name.en,
    desc: raw.desc[lang] || raw.desc.en,
    range: raw.range[lang] || raw.range.en,
    components: raw.components,
    ritual: raw.ritual,
    duration: raw.duration[lang] || raw.duration.en,
    concentration: raw.concentration,
    casting_time: raw.casting_time[lang] || raw.casting_time.en,
    level: raw.level,
    damage: raw.mechanics?.damage_type
      ? {
          damage_type: {
            index: raw.mechanics.damage_type,
            name: raw.mechanics.damage_type,
          },
        }
      : undefined,
    school: { index: raw.school, name: raw.school },
    classes: raw.classes.map((c: string) => ({ index: c, name: c })),
    mechanics: raw.mechanics,
    material: raw.material?.[lang] || raw.material?.en,
  };
}

export const ontologyRepository = {
  /**
   * Returns all spells localized in the given language.
   */
  getAll: async (lang: "en" | "fr" = "en"): Promise<Spell[]> => {
    const db = await loadDb();
    return db["@graph"].map((s) => mapToLanguage(s, lang));
  },

  /**
   * Finds a specific spell by index.
   */
  getById: async (
    index: string,
    lang: "en" | "fr" = "en",
  ): Promise<Spell | undefined> => {
    const db = await loadDb();
    const raw = db["@graph"].find((s) => s.index === index);
    return raw ? mapToLanguage(raw, lang) : undefined;
  },

  /**
   * Filters spells by damage type (semantic search).
   */
  getByDamageType: async (
    type: string,
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const db = await loadDb();
    return db["@graph"]
      .filter((s) => s.mechanics.damage_type === type)
      .map((s) => mapToLanguage(s, lang));
  },

  /**
   * Filters spells by saving throw ability.
   */
  getBySaveAbility: async (
    ability: AbilityScoreIndex,
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const db = await loadDb();
    return db["@graph"]
      .filter((s) => s.mechanics.save_ability === ability)
      .map((s) => mapToLanguage(s, lang));
  },

  /**
   * Returns all spells with a specific Area of Effect type.
   */
  getByAoEType: async (
    aoeType: NonNullable<SpellMechanics["area_of_effect"]>["type"],
    lang: "en" | "fr" = "en",
  ): Promise<Spell[]> => {
    const db = await loadDb();
    return db["@graph"]
      .filter((s) => s.mechanics.area_of_effect?.type === aoeType)
      .map((s) => mapToLanguage(s, lang));
  },
};
