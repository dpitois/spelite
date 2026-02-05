import { signal, effect, computed, batch } from "@preact/signals";
import type {
  CharacterData,
  Translation,
  TranslationDictionary,
  AbilityScores,
  HPState,
  UsedSlotsState,
} from "../types/dnd";
import fr from "../data/lang.fr.json";
import en from "../data/lang.en.json";

const STORAGE_KEY = "spelite-character-storage";
const translations: TranslationDictionary = {
  en,
  fr,
} as unknown as TranslationDictionary;

const generateId = () => Math.random().toString(36).substring(2, 9);
const now = () => Date.now();

const DEFAULT_STATE = {
  name: "Nouvel Aventurier",
  className: "wizard",
  subclass: "none",
  race: "none",
  level: 1,
  stats: { str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 },
  hp: { current: 10, max: 10, temp: 0 },
  baseAC: 10,
  knownSpells: [],
  preparedSpells: [],
  usedSlots: {},
};

// Helper to get initial state from localStorage
const getPersistedData = () => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (parsed.state) return parsed.state;
      return parsed;
    } catch (e) {
      console.error("Failed to parse saved data", e);
    }
  }
  return null;
};

const persisted = getPersistedData();

// --- Signals ---

export const language = signal<"en" | "fr">(persisted?.language || "fr");
export const t = computed<Translation>(() => translations[language.value]);

export const savedCharacters = signal<CharacterData[]>(
  persisted?.savedCharacters || [],
);
export const activeCharacterId = signal<string>(
  persisted?.id || savedCharacters.value[0]?.id || "",
);

const getActiveChar = (): CharacterData => {
  const char = savedCharacters.value.find(
    (c) => c.id === activeCharacterId.value,
  );
  if (char) return char;
  return {
    id: activeCharacterId.value || generateId(),
    ...DEFAULT_STATE,
    updatedAt: now(),
  };
};

const activeCharData = getActiveChar();

export const characterName = signal(activeCharData.name || DEFAULT_STATE.name);
export const className = signal(activeCharData.className || DEFAULT_STATE.className);
export const subclass = signal(activeCharData.subclass || DEFAULT_STATE.subclass);
export const race = signal(activeCharData.race || DEFAULT_STATE.race);
export const level = signal(activeCharData.level || DEFAULT_STATE.level);
export const stats = signal<AbilityScores>(
  activeCharData.stats || DEFAULT_STATE.stats,
);
export const hp = signal<HPState>(activeCharData.hp || DEFAULT_STATE.hp);
export const baseAC = signal(activeCharData.baseAC || DEFAULT_STATE.baseAC);
export const knownSpells = signal<string[]>(activeCharData.knownSpells || []);
export const preparedSpells = signal<string[]>(
  activeCharData.preparedSpells || [],
);
export const usedSlots = signal<UsedSlotsState>(
  activeCharData.usedSlots || {},
);

// --- Persistence ---

// This effect syncs the active character signals back to the savedCharacters list
effect(() => {
  const currentId = activeCharacterId.value;
  if (!currentId) return;

  const data: CharacterData = {
    id: currentId,
    name: characterName.value,
    className: className.value,
    subclass: subclass.value,
    race: race.value,
    level: level.value,
    stats: stats.value,
    hp: hp.value,
    baseAC: baseAC.value,
    knownSpells: knownSpells.value,
    preparedSpells: preparedSpells.value,
    usedSlots: usedSlots.value,
    updatedAt: now(),
  };

  const list = savedCharacters.peek();
  const idx = list.findIndex((c) => c.id === currentId);

  if (idx >= 0) {
    // Only update if data is actually different to avoid triggering observers of savedCharacters
    if (JSON.stringify(list[idx]) !== JSON.stringify(data)) {
      const newList = [...list];
      newList[idx] = data;
      savedCharacters.value = newList;
    }
  } else {
    savedCharacters.value = [...list, data];
  }
});

let saveTimeout: ReturnType<typeof setTimeout>;
effect(() => {
  const data = {
    id: activeCharacterId.value,
    language: language.value,
    savedCharacters: savedCharacters.value,
  };

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: data, version: 0 }),
    );
  }, 1000);
});

// --- Actions ---

export const actions = {
  setLanguage: (lang: "en" | "fr") => {
    language.value = lang;
  },

  setName: (name: string) => {
    characterName.value = name;
  },

  setClassName: (newClass: string) => {
    batch(() => {
      const oldClass = className.value.toLowerCase();
      const normalizedNew = newClass.toLowerCase();

      const isLegacyMigration =
        (oldClass === "rogue (arcane trickster)" &&
          normalizedNew === "rogue") ||
        (oldClass === "fighter (eldritch knight)" &&
          normalizedNew === "fighter");

      if (oldClass !== normalizedNew && !isLegacyMigration) {
        className.value = newClass;
        subclass.value = "none";
        knownSpells.value = [];
        preparedSpells.value = [];
      } else {
        className.value = newClass;
      }
    });
  },

  setSubclass: (s: string) => {
    subclass.value = s;
  },

  setRace: (r: string) => {
    race.value = r;
  },

  setLevel: (l: number) => {
    level.value = l;
  },

  setStats: (s: AbilityScores) => {
    stats.value = s;
  },

  setHP: (newHp: Partial<HPState>) => {
    hp.value = { ...hp.value, ...newHp };
  },

  setBaseAC: (ac: number) => {
    baseAC.value = ac;
  },

  learnSpell: (spellIndex: string) => {
    if (!knownSpells.value.includes(spellIndex)) {
      knownSpells.value = [...knownSpells.value, spellIndex];
    }
  },

  learnMultipleSpells: (spellIndexes: string[]) => {
    const newSpells = spellIndexes.filter(
      (id) => !knownSpells.value.includes(id),
    );
    if (newSpells.length > 0) {
      knownSpells.value = [...knownSpells.value, ...newSpells];
    }
  },

  forgetSpell: (spellIndex: string) => {
    batch(() => {
      knownSpells.value = knownSpells.value.filter((s) => s !== spellIndex);
      preparedSpells.value = preparedSpells.value.filter(
        (s) => s !== spellIndex,
      );
    });
  },

  prepareSpell: (spellIndex: string) => {
    if (!preparedSpells.value.includes(spellIndex)) {
      preparedSpells.value = [...preparedSpells.value, spellIndex];
    }
  },

  unprepareSpell: (spellIndex: string) => {
    preparedSpells.value = preparedSpells.value.filter((s) => s !== spellIndex);
  },

  spendSlot: (lvl: number) => {
    usedSlots.value = {
      ...usedSlots.value,
      [lvl]: (usedSlots.value[lvl] || 0) + 1,
    };
  },

  restoreSlot: (lvl: number) => {
    usedSlots.value = {
      ...usedSlots.value,
      [lvl]: Math.max(0, (usedSlots.value[lvl] || 0) - 1),
    };
  },

  setUsedSlots: (lvl: number, count: number) => {
    usedSlots.value = { ...usedSlots.value, [lvl]: count };
  },

  longRest: () => {
    usedSlots.value = {};
  },

  createCharacter: () => {
    batch(() => {
      const newId = generateId();
      activeCharacterId.value = newId;
      characterName.value = DEFAULT_STATE.name;
      className.value = DEFAULT_STATE.className;
      subclass.value = DEFAULT_STATE.subclass;
      race.value = DEFAULT_STATE.race;
      level.value = DEFAULT_STATE.level;
      stats.value = DEFAULT_STATE.stats;
      hp.value = DEFAULT_STATE.hp;
      baseAC.value = DEFAULT_STATE.baseAC;
      knownSpells.value = DEFAULT_STATE.knownSpells;
      preparedSpells.value = DEFAULT_STATE.preparedSpells;
      usedSlots.value = DEFAULT_STATE.usedSlots;
    });
  },

  loadCharacter: (id: string) => {
    const char = savedCharacters.value.find((c) => c.id === id);
    if (char) {
      batch(() => {
        activeCharacterId.value = id;
        characterName.value = char.name || DEFAULT_STATE.name;
        className.value = char.className || DEFAULT_STATE.className;
        subclass.value = char.subclass || DEFAULT_STATE.subclass;
        race.value = char.race || DEFAULT_STATE.race;
        level.value = char.level || DEFAULT_STATE.level;
        stats.value = char.stats || DEFAULT_STATE.stats;
        hp.value = char.hp || DEFAULT_STATE.hp;
        baseAC.value = char.baseAC || DEFAULT_STATE.baseAC;
        knownSpells.value = char.knownSpells || [];
        preparedSpells.value = char.preparedSpells || [];
        usedSlots.value = char.usedSlots || {};
      });
    }
  },

  deleteCharacter: (id: string) => {
    const newList = savedCharacters.value.filter((c) => c.id !== id);
    batch(() => {
      savedCharacters.value = newList;
      if (activeCharacterId.value === id) {
        if (newList.length > 0) {
          actions.loadCharacter(newList[0].id);
        } else {
          actions.createCharacter();
        }
      }
    });
  },

  exportCharacter: (id: string) => {
    let char = savedCharacters.value.find((c) => c.id === id);
    if (activeCharacterId.value === id) {
      char = {
        id,
        name: characterName.value,
        className: className.value,
        subclass: subclass.value,
        race: race.value,
        level: level.value,
        stats: stats.value,
        hp: hp.value,
        baseAC: baseAC.value,
        knownSpells: knownSpells.value,
        preparedSpells: preparedSpells.value,
        usedSlots: usedSlots.value,
        updatedAt: now(),
      };
    }

    if (!char) return;
    const data = JSON.stringify(char, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spelite-char-${char.name.replace(/\s+/g, "-").toLowerCase()}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  exportAllCharacters: () => {
    const data = JSON.stringify(savedCharacters.value, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `spelite-all-characters-${new Date().toISOString().split("T")[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  },

  importCharacters: (json: string) => {
    try {
      const data = JSON.parse(json);
      const charactersToImport = Array.isArray(data) ? data : [data];
      const isValid = (c: unknown): c is CharacterData =>
        !!c && typeof c === "object" && "name" in c && "className" in c;
      const validCharacters = charactersToImport.filter(isValid);

      if (validCharacters.length === 0)
        return { success: false, message: t.value.setup.importError };

      const newList = [...savedCharacters.peek()];
      validCharacters.forEach((char) => {
        const idx = newList.findIndex((c) => c.id === char.id);
        if (idx >= 0) newList[idx] = { ...char, updatedAt: now() };
        else newList.push({ ...char, updatedAt: now() });
      });
      savedCharacters.value = newList;

      return {
        success: true,
        message: (t.value.setup.importSuccess as string).replace(
          "{{n}}",
          validCharacters.length.toString(),
        ),
      };
    } catch {
      return {
        success: false,
        message: t.value.setup.importFileError as string,
      };
    }
  },
};
