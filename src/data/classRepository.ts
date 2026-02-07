import { db } from "./db";
import type { Class } from "../types/dnd";

async function reconstructClass(
  subject: string,
  lang: "en" | "fr",
): Promise<Class> {
  const triplets = await db.triplets.where("s").equals(subject).toArray();

  const getSingle = (predicate: string) =>
    triplets.find((t) => t.p === predicate)?.o;

  const getLocalized = (predicate: string) => {
    const localized = triplets.find(
      (t) => t.p === predicate && t.lang === lang,
    );
    if (localized) return localized.o;
    return triplets.find(
      (t) => t.p === predicate && (t.lang === "en" || !t.lang),
    )?.o;
  };

  const spellcastingAbility = getSingle("dnd:spellcasting_ability") as
    | string
    | undefined;

  return {
    index: getSingle("dnd:index") as string,
    name: getLocalized("dnd:name") as string,
    hit_die: getSingle("dnd:hit_die") as number,
    spellcasting: spellcastingAbility
      ? {
          level: 1, // Default to level 1 for now
          spellcasting_ability: {
            index: spellcastingAbility,
            name: spellcastingAbility,
          },
          info: [],
        }
      : undefined,
  };
}

export const classRepository = {
  getAll: async (lang: "en" | "fr" = "en"): Promise<Class[]> => {
    const allTriplets = await db.triplets
      .where("p")
      .equals("dnd:hit_die")
      .toArray();
    const uniqueSubjects = Array.from(new Set(allTriplets.map((t) => t.s)));

    const classes = await Promise.all(
      uniqueSubjects.map((s) => reconstructClass(s, lang)),
    );
    return classes.sort((a, b) => a.name.localeCompare(b.name, lang));
  },

  getById: async (
    index: string,
    lang: "en" | "fr" = "en",
  ): Promise<Class | undefined> => {
    const triplet = await db.triplets
      .where("[p+o]")
      .equals(["dnd:index", index])
      .first();
    if (!triplet) return undefined;

    // Ensure it's a class by checking for hit_die
    const hasHitDie = await db.triplets
      .where({ s: triplet.s, p: "dnd:hit_die" })
      .first();
    if (!hasHitDie) return undefined;

    return reconstructClass(triplet.s, lang);
  },
};
