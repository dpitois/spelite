import type { Triplet } from "../data/db";

export function flattenToTriplets(item: Record<string, unknown>): Triplet[] {
  const triplets: Triplet[] = [];
  const s = item["@id"] as string;

  if (!s) return [];

  const transformValue = (val: unknown): string | number => {
    if (typeof val === "boolean") return val ? 1 : 0;
    return val as string | number;
  };

  // 1. Basic properties (single values)
  const basicProps = [
    "level",
    "school",
    "ritual",
    "concentration",
    "index",
    "hit_die",
    "spellcasting_ability",
  ];
  basicProps.forEach((p) => {
    const val = item[p];
    if (val !== undefined && val !== null) {
      triplets.push({ s, p: `dnd:${p}`, o: transformValue(val) });
    }
  });

  // 2. Arrays (components, classes, etc.)
  const arrayProps = ["components", "classes"];
  arrayProps.forEach((p) => {
    const val = item[p];
    if (Array.isArray(val)) {
      val.forEach((entry: unknown) => {
        triplets.push({ s, p: `dnd:${p}`, o: transformValue(entry) });
      });
    }
  });

  // 3. Localized strings (name, range, duration, casting_time, material)
  const localizedProps = [
    "name",
    "range",
    "duration",
    "casting_time",
    "material",
  ];
  localizedProps.forEach((p) => {
    const val = item[p];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.entries(val as Record<string, unknown>).forEach(([lang, o]) => {
        if (o !== null && o !== undefined) {
          triplets.push({ s, p: `dnd:${p}`, o: transformValue(o), lang });
        }
      });
    }
  });

  // 4. Descriptions (special handling for arrays of strings or single localized strings)
  const desc = item.desc;
  if (desc && typeof desc === "object" && !Array.isArray(desc)) {
    Object.entries(desc as Record<string, unknown>).forEach(([lang, val]) => {
      if (Array.isArray(val)) {
        triplets.push({
          s,
          p: "dnd:desc",
          o: (val as string[]).join("\n"),
          lang,
        });
      } else if (typeof val === "string") {
        triplets.push({
          s,
          p: "dnd:desc",
          o: val,
          lang,
        });
      }
    });
  }

  // 5. Mechanics (nested object for Spells)
  const mechanics = item.mechanics;
  if (mechanics && typeof mechanics === "object" && !Array.isArray(mechanics)) {
    Object.entries(mechanics as Record<string, unknown>).forEach(([p, o]) => {
      if (o !== null && o !== undefined) {
        if (
          p === "area_of_effect" &&
          typeof o === "object" &&
          !Array.isArray(o)
        ) {
          Object.entries(o as Record<string, unknown>).forEach(
            ([subP, subO]) => {
              triplets.push({
                s,
                p: `dnd:area_of_effect_${subP}`,
                o: transformValue(subO),
              });
            },
          );
        } else if (typeof o !== "object") {
          triplets.push({ s, p: `dnd:${p}`, o: transformValue(o) });
        }
      }
    });
  }

  return triplets;
}

export function flattenGraphToTriplets(graph: unknown[]): Triplet[] {
  return graph.flatMap((item) =>
    flattenToTriplets(item as Record<string, unknown>),
  );
}
