import { useState, useEffect, useMemo } from "preact/hooks";
import { t, language, actions } from "../store/signals";
import { useCharacter } from "../hooks/useCharacter";
import { ontologyRepository } from "../data/ontologyRepository";
import { parseQuery } from "../utils/search/queryParser";
import { BrowserHeader } from "../components/browser/BrowserHeader";
import { BrowserFilters } from "../components/browser/BrowserFilters";
import { SpellGrid } from "../components/browser/SpellGrid";
import type { Spell, AbilityScoreIndex } from "../types/dnd";

export function SpellBrowser() {
  const char = useCharacter();
  const currentLang = language.value;
  const currentT = t.value;

  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "known" | "learnable"
  >("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [filterDamage, setFilterDamage] = useState<string>("all");
  const [filterSave, setFilterSave] = useState<string>("all");

  // Dynamic options for filters (based on initial load or static logic)
  const [filterOptions, setFilterOptions] = useState<{
    schools: string[];
    damageTypes: string[];
    saveAbilities: string[];
  }>({ schools: [], damageTypes: [], saveAbilities: [] });

  const availableLevels = Array.from(
    { length: char.maxSpellLevel + 1 },
    (_, i) => i,
  );

  // Initial load to populate filter options
  useEffect(() => {
    async function loadOptions() {
      const all = await ontologyRepository.getAll(currentLang);
      const schools = new Set<string>();
      const damageTypes = new Set<string>();
      const saveAbilities = new Set<string>();

      all.forEach((s) => {
        schools.add(s.school.name);
        if (s.mechanics?.damage_type) damageTypes.add(s.mechanics.damage_type);
        if (s.mechanics?.save_ability)
          saveAbilities.add(s.mechanics.save_ability);
      });

      setFilterOptions({
        schools: Array.from(schools).sort(),
        damageTypes: Array.from(damageTypes).sort(),
        saveAbilities: Array.from(saveAbilities).sort(),
      });
    }
    loadOptions();
  }, [currentLang]);

  // Main search effect
  useEffect(() => {
    let mounted = true;

    async function performSearch() {
      setLoading(true);

      // 1. Parse natural language search
      const query = parseQuery(searchTerm);

      // 2. Merge manual dropdown filters into query if they are not "all"
      if (filterLevel !== "all") {
        if (!query.filters.level) query.filters.level = [];
        query.filters.level.push(parseInt(filterLevel));
      }
      if (filterSchool !== "all") {
        if (!query.filters.school) query.filters.school = [];
        query.filters.school.push(filterSchool);
      }
      if (filterDamage !== "all") {
        if (!query.filters.damageType) query.filters.damageType = [];
        query.filters.damageType.push(filterDamage);
      }
      if (filterSave !== "all") {
        if (!query.filters.saveAbility) query.filters.saveAbility = [];
        query.filters.saveAbility.push(filterSave as AbilityScoreIndex);
      }

      // 3. Execute semantic search on Triplet Store
      const results = await ontologyRepository.search(query, currentLang);

      if (mounted) {
        setSpells(results);
        setLoading(false);
      }
    }

    const timer = setTimeout(performSearch, searchTerm ? 300 : 0);

    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [
    searchTerm,
    filterLevel,
    filterSchool,
    filterDamage,
    filterSave,
    currentLang,
  ]);

  // Post-processing: Apply character-specific filters on results
  const filteredSpells = useMemo(() => {
    let results = spells;
    const sources = char.spellSources;

    // Filter by class sources (unless explicitly searched otherwise via NL?)
    // For now, we maintain the "class view" constraint of the character
    if (sources.length > 0) {
      results = results.filter((spell) =>
        spell.classes.some((c) => sources.includes(c.index)),
      );
    }

    // Level constraint (don't show spells above max level available)
    if (char.maxSpellLevel >= 0) {
      results = results.filter((spell) => spell.level <= char.maxSpellLevel);
    }

    // Status filter
    if (filterStatus === "known") {
      results = results.filter((spell) =>
        char.knownSpells.includes(spell.index),
      );
    } else if (filterStatus === "learnable") {
      results = results.filter(
        (spell) => !char.knownSpells.includes(spell.index),
      );
    }

    return results;
  }, [
    spells,
    char.spellSources,
    char.maxSpellLevel,
    char.knownSpells,
    filterStatus,
  ]);

  const handleReset = () => {
    if (char.knownSpells.length === 0) return;
    if (window.confirm(currentT.grimoire.resetConfirm)) {
      char.knownSpells.forEach((id) => actions.forgetSpell(id));
    }
  };

  const handleLearnAll = () => {
    const toLearn = filteredSpells.map((s) => s.index);
    if (toLearn.length === 0) return;
    if (
      window.confirm(
        `Voulez-vous ajouter les ${toLearn.length} sorts affichés à votre grimoire ?`,
      )
    ) {
      actions.learnMultipleSpells(toLearn);
    }
  };

  return (
    <div className="space-y-6">
      <BrowserHeader
        className={char.className}
        maxSpellLevel={char.maxSpellLevel}
        isPrepareAllClass={char.isPrepareAllClass}
        knownSpellsCount={char.knownSpells.length}
        onLearnAll={handleLearnAll}
        onReset={handleReset}
        t={currentT}
      >
        <BrowserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          filterSchool={filterSchool}
          setFilterSchool={setFilterSchool}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterDamage={filterDamage}
          setFilterDamage={setFilterDamage}
          filterSave={filterSave}
          setFilterSave={setFilterSave}
          availableLevels={availableLevels}
          schools={filterOptions.schools}
          damageTypes={filterOptions.damageTypes}
          saveAbilities={filterOptions.saveAbilities}
          t={currentT}
        />
      </BrowserHeader>

      <SpellGrid
        spells={filteredSpells}
        loading={loading}
        knownSpells={char.knownSpells}
        bonusSpellIndexes={char.bonusSpellIndexes}
        onLearn={actions.learnSpell}
        onForget={actions.forgetSpell}
        language={currentLang}
        t={currentT}
      />
    </div>
  );
}
