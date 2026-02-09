/**
 * Converts a D&D duration string into a numeric value in rounds for comparison.
 */
export function getDurationValue(duration: string): number {
  const normalized = duration.toLowerCase();

  if (
    normalized.includes("instantaneous") ||
    normalized.includes("instantanée")
  )
    return 0;
  if (
    normalized.includes("until dispelled") ||
    normalized.includes("jusqu'à ce qu'il soit dissipé")
  )
    return 999999;
  if (normalized.includes("special") || normalized.includes("spécial"))
    return 888888;

  const match = normalized.match(
    /(\d+)\s+(round|minute|hour|day|an|year|jour|heure)/,
  );
  if (!match) return 1; // Default to 1 round for "1 action" etc if listed as duration

  const value = parseInt(match[1]);
  const unit = match[2];

  switch (unit) {
    case "round":
      return value;
    case "minute":
      return value * 10;
    case "hour":
    case "heure":
      return value * 600;
    case "day":
    case "jour":
      return value * 14400;
    case "year":
    case "an":
      return value * 5256000;
    default:
      return value;
  }
}

/**
 * Converts a D&D range string into a numeric value in feet for comparison.
 */
export function getRangeValue(range: string): number {
  const normalized = range.toLowerCase();

  if (normalized.includes("self") || normalized.includes("personnelle"))
    return 0;
  if (normalized.includes("touch") || normalized.includes("contact")) return 1;
  if (normalized.includes("sight") || normalized.includes("vue")) return 999998;
  if (normalized.includes("unlimited") || normalized.includes("illimitée"))
    return 999999;
  if (normalized.includes("special") || normalized.includes("spécial"))
    return 888888;

  // Handle both feet (EN) and meters (FR)
  // 1 meter approx 3.28 feet, but we can stay simple: 1.5m = 5ft, 9m = 30ft, 18m = 60ft
  const feetMatch = normalized.match(/(\d+)\s+(foot|feet)/);
  if (feetMatch) return parseInt(feetMatch[1]);

  const meterMatch = normalized.match(/(\d+(\.\d+)?)\s+mètre/);
  if (meterMatch) return Math.round(parseFloat(meterMatch[1]) * 3.28);

  const mileMatch = normalized.match(/(\d+)\s+mile/);
  if (mileMatch) return parseInt(mileMatch[1]) * 5280;

  return 0;
}

/**
 * Sorting options for the Spell Browser.
 */
export type SortOption = "name" | "level" | "range" | "duration";

export interface SortState {
  by: SortOption;
  order: "asc" | "desc";
}
