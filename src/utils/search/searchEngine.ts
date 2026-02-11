import { ontologyRepository } from "../../data/ontologyRepository";
import { parseQuery } from "./queryParser";
import { semanticBridge } from "./semanticBridge";
import type { Spell, AbilityScoreIndex } from "../../types/dnd";

export interface SearchFilters {
  level: string;
  class: string;
  school: string;
  damage: string;
  save: string;
  action: string;
}

export interface SearchParams {
  searchTerm: string;
  aiSearchEnabled: boolean;
  isModelReady: boolean;
  indexingProgress: number;
  currentLang: "en" | "fr";
  filters: SearchFilters;
}

export async function searchSpells({
  searchTerm,
  aiSearchEnabled,
  isModelReady,
  indexingProgress,
  currentLang,
  filters,
}: SearchParams): Promise<Spell[]> {
  // 1. Parse natural language search
  const query = parseQuery(searchTerm);

  // 2. Merge manual dropdown filters into query
  if (filters.level !== "all") {
    if (!query.filters.level) query.filters.level = [];
    query.filters.level.push(parseInt(filters.level));
  }
  if (filters.class !== "all") {
    if (!query.filters.class) query.filters.class = [];
    query.filters.class.push(filters.class);
  }
  if (filters.school !== "all") {
    if (!query.filters.school) query.filters.school = [];
    query.filters.school.push(filters.school);
  }
  if (filters.damage !== "all") {
    if (!query.filters.damageType) query.filters.damageType = [];
    query.filters.damageType.push(filters.damage);
  }
  if (filters.save !== "all") {
    if (!query.filters.saveAbility) query.filters.saveAbility = [];
    query.filters.saveAbility.push(filters.save as AbilityScoreIndex);
  }
  if (filters.action !== "all") {
    if (!query.filters.actionType) query.filters.actionType = [];
    query.filters.actionType.push(filters.action);
  }

  // 3. Execute search
  const textToSearch = query.text.trim();

  // BUG HERE: It doesn't check aiSearchEnabled!
  // If we have text and semantic search is enabled AND model is ready AND indexed, we do a 2-step search
  if (
    aiSearchEnabled &&
    textToSearch &&
    isModelReady &&
    indexingProgress >= 100
  ) {
    // Step A: Get spells filtered by metadata only (no text filter yet)
    const metadataQuery = { ...query, text: "" };
    const candidateSpells = await ontologyRepository.search(
      metadataQuery,
      currentLang,
    );

    if (candidateSpells.length > 0) {
      // Step B: Semantic ranking
      const documents = candidateSpells.map(
        (s) => `${s.name}: ${s.desc.slice(0, 10).join(" ")}`,
      );

      try {
        const semanticResults = await semanticBridge.search(
          textToSearch,
          documents,
        );

        if (semanticResults.length > 0) {
          const bestScore = semanticResults[0].score;

          // Dynamic threshold: at least 0.25 AND at least 60% of the best score
          const threshold = Math.max(0.25, bestScore * 0.6);

          // Hybridization: Identify spells that match lexical search on name
          const searchTerms = textToSearch
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .split(/\s+/)
            .filter((t) => t.length > 0);

          const rankedSpells = semanticResults
            .filter((res) => {
              // Keep if above threshold OR if it's a lexical match on name
              if (res.score >= threshold) return true;

              const spell = candidateSpells[res.index];
              const normalizedName = spell.name
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

              // If all search terms are in the name, it's a lexical match
              return searchTerms.every((term) => normalizedName.includes(term));
            })
            .map((res) => candidateSpells[res.index]);

          return rankedSpells;
        }
      } catch (err) {
        console.error("[SearchEngine] Semantic search error:", err);
        // Fallback to normal search below
      }
    }
  }

  // Default: Normal ontology search (includes fuzzy name filtering)
  return ontologyRepository.search(query, currentLang);
}
