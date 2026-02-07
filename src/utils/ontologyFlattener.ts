import type { Triplet } from "../data/db";

export function flattenSpellToTriplets(
  spell: Record<string, unknown>,
): Triplet[] {
  const triplets: Triplet[] = [];
  const s = spell["@id"] as string;

  if (!s) return [];

  // 1. Basic properties
  const basicProps = ["level", "school", "ritual", "concentration", "index"];
  basicProps.forEach((p) => {
    const val = spell[p];
    if (val !== undefined && val !== null) {
      triplets.push({ s, p: `dnd:${p}`, o: val as string | number | boolean });
    }
  });

  // 2. Arrays (components, classes)
  const arrayProps = ["components", "classes"];
  arrayProps.forEach((p) => {
    const val = spell[p];
    if (Array.isArray(val)) {
      val.forEach((item: unknown) => {
        triplets.push({
          s,
          p: `dnd:${p}`,
          o: item as string | number | boolean,
        });
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
    const val = spell[p];
    if (val && typeof val === "object" && !Array.isArray(val)) {
      Object.entries(val as Record<string, unknown>).forEach(([lang, o]) => {
        if (o !== null && o !== undefined) {
          triplets.push({
            s,
            p: `dnd:${p}`,
            o: o as string | number | boolean,
            lang,
          });
        }
      });
    }
  });

  // 4. Descriptions (special handling for arrays of strings)
  const desc = spell.desc;
  if (desc && typeof desc === "object" && !Array.isArray(desc)) {
    Object.entries(desc as Record<string, unknown>).forEach(([lang, val]) => {
      if (Array.isArray(val)) {
        triplets.push({
          s,
          p: "dnd:desc",
          o: (val as string[]).join("\n"),
          lang,
        });
      }
    });
  }

  // 5. Mechanics (nested object)
  const mechanics = spell.mechanics;
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
                o: subO as string | number | boolean,
              });
            },
          );
        } else if (typeof o !== "object") {
          triplets.push({
            s,
            p: `dnd:${p}`,
            o: o as string | number | boolean,
          });
        }
      }
    });
  }

  return triplets;
}

export function flattenGraphToTriplets(graph: unknown[]): Triplet[] {
  return graph.flatMap((item) =>
    flattenSpellToTriplets(item as Record<string, unknown>),
  );
}
