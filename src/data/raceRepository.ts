import { db } from "./db";
import type { Race } from "../types/dnd";

async function reconstructRace(
  subject: string,
  lang: "en" | "fr",
): Promise<Race> {
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

  return {
    index: getSingle("dnd:index") as string,
    name: getLocalized("dnd:name") as string,
  };
}

export const raceRepository = {
  getAll: async (lang: "en" | "fr" = "en"): Promise<Race[]> => {
    // Look for subjects that have a dnd:index and are in the races: namespace (from @id)
    const allTriplets = await db.triplets
      .where("p")
      .equals("dnd:index")
      .toArray();
    const uniqueSubjects = Array.from(
      new Set(allTriplets.map((t) => t.s)),
    ).filter((s) => s.startsWith("races:"));

    const races = await Promise.all(
      uniqueSubjects.map((s) => reconstructRace(s, lang)),
    );
    return races.sort((a, b) => a.name.localeCompare(b.name, lang));
  },

  getById: async (
    index: string,
    lang: "en" | "fr" = "en",
  ): Promise<Race | undefined> => {
    const triplet = await db.triplets
      .where("[p+o]")
      .equals(["dnd:index", index])
      .first();
    if (!triplet || !triplet.s.startsWith("races:")) return undefined;

    return reconstructRace(triplet.s, lang);
  },
};
