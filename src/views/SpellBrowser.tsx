import { useState, useEffect, useMemo, useRef } from "preact/hooks";
import { t, language, actions, aiSearchEnabled } from "../store/signals";
import { useCharacter } from "../hooks/useCharacter";
import { ontologyRepository } from "../data/ontologyRepository";
import { searchSpells } from "../utils/search/searchEngine";
import { semanticBridge } from "../utils/search/semanticBridge";
import { BrowserHeader } from "../components/browser/BrowserHeader";
import { BrowserFilters } from "../components/browser/BrowserFilters";
import { FilterDrawer } from "../components/browser/FilterDrawer";
import { SpellGrid } from "../components/browser/SpellGrid";
import type { Spell } from "../types/dnd";
import {
  getDurationValue,
  getRangeValue,
  type SortOption,
} from "../utils/spellSorting";

export function SpellBrowser() {
  const char = useCharacter();
  const currentLang = language.value;
  const currentT = t.value;
  const isAIEnabled = aiSearchEnabled.value;

  const [spells, setSpells] = useState<Spell[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModelReady, setIsModelReady] = useState(semanticBridge.initialized);
  const [indexingProgress, setIndexingProgress] = useState(
    semanticBridge.initialized ? 100 : 0,
  );

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");

  const lastRequestId = useRef(0);

  const [filterLevel, setFilterLevel] = useState<string>("all");
  // Use the effective spell source (e.g., "wizard" for Arcane Trickster) instead of the raw class name ("rogue")
  const defaultClass =
    char.spellSources.length > 0
      ? char.spellSources[0]
      : char.className || "all";
  const [filterClass, setFilterClass] = useState<string>(defaultClass);
  const [filterStatus, setFilterStatus] = useState<
    "all" | "known" | "learnable"
  >("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [filterDamage, setFilterDamage] = useState<string>("all");
  const [filterSave, setFilterSave] = useState<string>("all");
  const [filterAction, setFilterAction] = useState<string>("all");

  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Dynamic options for filters
  const [filterOptions, setFilterOptions] = useState<{
    classes: string[];
    schools: string[];
    damageTypes: string[];
    saveAbilities: string[];
  }>({ classes: [], schools: [], damageTypes: [], saveAbilities: [] });

  // Initial load to populate filter options
  useEffect(() => {
    async function loadOptions() {
      // Initialize semantic model if enabled
      if (isAIEnabled && !semanticBridge.initialized) {
        console.log("[SpellBrowser] Initializing semantic model...");

        semanticBridge.setProgressCallback((p) => {
          if (p.status === "progress") {
            // Downloading progress
          } else if (p.status === "indexing") {
            // Indexing progress
            setIndexingProgress(p.progress);
          }
        });

        semanticBridge
          .initModel()
          .then(() => {
            setIsModelReady(true);

            // Background indexing
            ontologyRepository.getAll(currentLang).then((allSpells) => {
              const documents = allSpells.map(
                (s) => `${s.name}: ${s.desc.slice(0, 10).join(" ")}`,
              );
              semanticBridge.search("warmup", documents).then(() => {
                setIndexingProgress(100);
              });
            });
          })
          .catch((err) => {
            console.error(
              "[SpellBrowser] Failed to initialize semantic model:",
              err,
            );
          });
      }

      const all = await ontologyRepository.getAll(currentLang);
      const schools = new Set<string>();
      const damageTypes = new Set<string>();
      const saveAbilities = new Set<string>();
      const classes = new Set<string>();

      all.forEach((s) => {
        schools.add(s.school.name);
        s.classes.forEach((c) => classes.add(c.index));
        if (s.mechanics?.damage_type) damageTypes.add(s.mechanics.damage_type);
        if (s.mechanics?.save_ability)
          saveAbilities.add(s.mechanics.save_ability);
      });

      setFilterOptions({
        classes: Array.from(classes).sort(),
        schools: Array.from(schools).sort(),
        damageTypes: Array.from(damageTypes).sort(),
        saveAbilities: Array.from(saveAbilities).sort(),
      });
    }
    loadOptions();
  }, [currentLang, isAIEnabled]);

  // Main search effect
  useEffect(() => {
    let mounted = true;

    async function performSearch() {
      const requestId = ++lastRequestId.current;
      setLoading(true);

      const results = await searchSpells({
        searchTerm,
        aiSearchEnabled: isAIEnabled,
        isModelReady,
        indexingProgress, // Still passed to the engine but won't trigger the effect itself
        currentLang,
        filters: {
          level: filterLevel,
          class: filterClass,
          school: filterSchool,
          damage: filterDamage,
          save: filterSave,
          action: filterAction,
        },
      });

      if (mounted && requestId === lastRequestId.current) {
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
    filterClass,
    filterSchool,
    filterDamage,
    filterSave,
    filterAction,
    currentLang,
    isModelReady,
    isAIEnabled,
    indexingProgress === 100, // Trigger once when finished indexing
  ]);

  // Post-processing (Status filtering + Sorting)
  const filteredSpells = useMemo(() => {
    let results = [...spells];

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

    // Manual Sorting
    // If AI is enabled and we are searching by text, semantic search already ranks results.
    // However, if the user explicitly chooses a sort (other than name or if they change order), we apply it.
    const isSearchingText = searchTerm.trim().length > 0;
    const isAIDriven = isAIEnabled && isSearchingText;

    // Apply manual sort if not default AI ranking or if user changed order/sortBy
    if (!isAIDriven || sortBy !== "name" || sortOrder !== "asc") {
      results.sort((a, b) => {
        let comparison = 0;
        if (sortBy === "level") {
          comparison = a.level - b.level;
        } else if (sortBy === "range") {
          comparison = getRangeValue(a.range) - getRangeValue(b.range);
        } else if (sortBy === "duration") {
          comparison =
            getDurationValue(a.duration) - getDurationValue(b.duration);
        }

        // Fallback to name for tie-breaking or default name sort
        if (comparison === 0) {
          comparison = a.name.localeCompare(b.name, currentLang);
        }

        return sortOrder === "asc" ? comparison : -comparison;
      });
    }

    return results;
  }, [
    spells,
    char.knownSpells,
    filterStatus,
    sortBy,
    sortOrder,
    searchTerm,
    isAIEnabled,
    currentLang,
  ]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filterSchool !== "all") count++;
    if (filterStatus !== "all") count++;
    if (filterDamage !== "all") count++;
    if (filterSave !== "all") count++;
    if (filterAction !== "all") count++;
    return count;
  }, [filterSchool, filterStatus, filterDamage, filterSave, filterAction]);

  const handleResetAdvancedFilters = () => {
    setFilterSchool("all");
    setFilterStatus("all");
    setFilterDamage("all");
    setFilterSave("all");
    setFilterAction("all");
    setSortBy("name");
    setSortOrder("asc");
  };

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
        isModelReady={isModelReady}
        aiSearchEnabled={isAIEnabled}
        onToggleAI={actions.toggleAISearch}
        indexingProgress={indexingProgress}
      >
        <BrowserFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterLevel={filterLevel}
          setFilterLevel={setFilterLevel}
          filterClass={filterClass}
          setFilterClass={setFilterClass}
          onOpenFilters={() => setIsFiltersOpen(true)}
          activeFiltersCount={activeFiltersCount}
          classes={filterOptions.classes}
          t={currentT}
        />
      </BrowserHeader>

      <FilterDrawer
        isOpen={isFiltersOpen}
        onClose={() => setIsFiltersOpen(false)}
        filterSchool={filterSchool}
        setFilterSchool={setFilterSchool}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterDamage={filterDamage}
        setFilterDamage={setFilterDamage}
        filterSave={filterSave}
        setFilterSave={setFilterSave}
        filterAction={filterAction}
        setFilterAction={setFilterAction}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        schools={filterOptions.schools}
        damageTypes={filterOptions.damageTypes}
        saveAbilities={filterOptions.saveAbilities}
        onReset={handleResetAdvancedFilters}
        t={currentT}
      />

      <SpellGrid
        spells={filteredSpells}
        loading={loading}
        knownSpells={char.knownSpells}
        bonusSpellIndexes={char.bonusSpellIndexes}
        onLearn={actions.learnSpell}
        onForget={actions.forgetSpell}
        language={currentLang}
        t={currentT}
        maxSpellLevel={char.maxSpellLevel}
        allowedClasses={char.spellSources}
      />
    </div>
  );
}
