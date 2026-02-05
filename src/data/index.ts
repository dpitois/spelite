import type { Spell, SpellCache } from "../types/dnd";

// Cache in-memory to avoid re-fetching/re-parsing the JSON chunk
// if the user switches views back and forth.
const memoryCache: SpellCache = {};

export const spellRepository = {
  /**
   * Asynchronously loads the spell database for the specified language.
   * Uses dynamic imports to split code chunks (Lazy Loading).
   */
  getAll: async (lang: "fr" | "en" = "en"): Promise<Spell[]> => {
    if (memoryCache[lang]) {
      return memoryCache[lang];
    }

    let data: { default: Spell[] };

    try {
      if (lang === "fr") {
        // Vite will detect this import and create a separate chunk
        data = (await import("./spells.fr.json")) as unknown as {
          default: Spell[];
        };
      } else {
        data = (await import("./spells.en.json")) as unknown as {
          default: Spell[];
        };
      }

      memoryCache[lang] = data.default;
      return data.default;
    } catch (error) {
      console.error(`Failed to load spells for lang: ${lang}`, error);
      return [];
    }
  },

  /**
   * Helper to find a specific spell.
   * Note: This effectively loads the whole DB anyway because of how JSON imports work.
   */
  getById: async (
    index: string,
    lang: "fr" | "en" = "en",
  ): Promise<Spell | undefined> => {
    const spells = await spellRepository.getAll(lang);
    return spells.find((s) => s.index === index);
  },
};
