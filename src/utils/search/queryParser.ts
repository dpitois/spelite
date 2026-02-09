import { LEXICON } from "./lexicon";
import type { AbilityScoreIndex } from "../../types/dnd";

export interface SearchQuery {
  text: string;
  filters: {
    level?: number[];
    school?: string[];
    class?: string[];
    damageType?: string[];
    saveAbility?: AbilityScoreIndex[];
    ritual?: boolean;
    concentration?: boolean;
    hasSave?: boolean;
    hasAttack?: boolean;
    actionType?: string[];
  };
}

/**
 * Normalizes text for searching: lowercase, remove accents.
 */
function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Parses a natural language query into a structured SearchQuery object.
 */
export function parseQuery(input: string): SearchQuery {
  const normalizedInput = normalize(input);
  const tokens = normalizedInput.split(/[\s,']+/).filter((t) => t.length > 0);

  const query: SearchQuery = {
    text: "",
    filters: {},
  };

  const unusedTokens: string[] = [];
  let skipNext = false;
  let isNegated = false;

  tokens.forEach((token, index) => {
    if (skipNext) {
      skipNext = false;
      return;
    }

    const entry = LEXICON[token];

    if (entry) {
      switch (entry.type) {
        case "NEGATION":
          isNegated = true;
          break;
        case "LEVEL":
          if (entry.value === -1) {
            const nextToken = tokens[index + 1];
            if (nextToken && /^\d$/.test(nextToken)) {
              if (!query.filters.level) query.filters.level = [];
              query.filters.level.push(parseInt(nextToken));
              skipNext = true;
            }
          } else {
            if (!query.filters.level) query.filters.level = [];
            query.filters.level.push(entry.value as number);
          }
          isNegated = false;
          break;
        case "SCHOOL":
          if (!query.filters.school) query.filters.school = [];
          query.filters.school.push(entry.value as string);
          isNegated = false;
          break;
        case "CLASS":
          if (!query.filters.class) query.filters.class = [];
          query.filters.class.push(entry.value as string);
          isNegated = false;
          break;
        case "DAMAGE":
          if (!query.filters.damageType) query.filters.damageType = [];
          query.filters.damageType.push(entry.value as string);
          isNegated = false;
          break;
        case "SAVE":
          if (!query.filters.saveAbility) query.filters.saveAbility = [];
          query.filters.saveAbility.push(entry.value as AbilityScoreIndex);
          query.filters.hasSave = true;
          isNegated = false;
          break;
        case "RITUAL":
          query.filters.ritual = !isNegated;
          // Don't reset isNegated if it might apply to the next word too (like "sans rituel ni concentration")
          // But for now, let's reset it to be safe, unless it's a specific prompt
          isNegated = false;
          break;
        case "CONCENTRATION":
          query.filters.concentration = !isNegated;
          isNegated = false;
          break;
        case "SAVE_PROMPT":
          // Special case: don't reset if we have "sans jet de sauvegarde"
          // "jet" and "sauvegarde" both trigger this. If we already set it to false, keep it false.
          if (query.filters.hasSave === undefined || isNegated) {
            query.filters.hasSave = !isNegated;
          }
          // Note: we don't reset isNegated here so it can carry over "jet" to "sauvegarde"
          break;
        case "ATTACK_PROMPT":
          if (query.filters.hasAttack === undefined || isNegated) {
            query.filters.hasAttack = !isNegated;
          }
          break;
        case "ACTION_TYPE":
          if (!query.filters.actionType) query.filters.actionType = [];
          query.filters.actionType.push(entry.value as string);
          isNegated = false;
          break;
        case "NOISE":
          // Noise words like "de" don't reset negation
          break;
      }
    } else {
      unusedTokens.push(token);
      isNegated = false;
    }
  });

  query.text = unusedTokens.join(" ").trim();
  return query;
}
