import { useState, useEffect, useMemo } from "preact/hooks";
import { t, language, actions } from "../store/signals";
import { useCharacter } from "../hooks/useCharacter";
import { ontologyRepository } from "../data/ontologyRepository";
import { BrowserHeader } from "../components/browser/BrowserHeader";
import { BrowserFilters } from "../components/browser/BrowserFilters";
import { SpellGrid } from "../components/browser/SpellGrid";
import type { Spell } from "../types/dnd";

export function SpellBrowser() {
  const char = useCharacter();
  const currentLang = language.value;
  const currentT = t.value;

  const [allSpells, setAllSpells] = useState<Spell[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [filterStatus, setFilterStatus] = useState<
    "all" | "known" | "learnable"
  >("all");
  const [filterSchool, setFilterSchool] = useState<string>("all");
  const [filterDamage, setFilterDamage] = useState<string>("all");
  const [filterSave, setFilterSave] = useState<string>("all");

  const availableLevels = Array.from(
    { length: char.maxSpellLevel + 1 },
    (_, i) => i,
  );

  // Get unique schools from all spells
  const schools = useMemo(() => {
    const unique = new Set<string>();
    allSpells.forEach((s) => unique.add(s.school.name));
    return Array.from(unique).sort();
  }, [allSpells]);

  // Get unique damage types and save abilities from all spells
  const damageTypes = useMemo(() => {
    const unique = new Set<string>();
    allSpells.forEach((s) => {
      if (s.mechanics?.damage_type) unique.add(s.mechanics.damage_type);
    });
    return Array.from(unique).sort();
  }, [allSpells]);

  const saveAbilities = useMemo(() => {
    const unique = new Set<string>();
    allSpells.forEach((s) => {
      if (s.mechanics?.save_ability) unique.add(s.mechanics.save_ability);
    });
    return Array.from(unique).sort();
  }, [allSpells]);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      const spells = await ontologyRepository.getAll(currentLang);
      if (mounted) {
        setAllSpells(spells);
        setLoading(false);
      }
    }

    load();

    return () => {
      mounted = false;
    };
  }, [currentLang]);

  const filteredSpells = useMemo(() => {
    let results = allSpells;
    const sources = char.spellSources;

    if (sources.length > 0) {
      results = results.filter((spell) =>
        spell.classes.some((c) => sources.includes(c.index)),
      );
    }

    if (searchTerm) {
      results = results.filter((spell) =>
        spell.name.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (char.maxSpellLevel >= 0) {
      results = results.filter((spell) => spell.level <= char.maxSpellLevel);
    }

    if (filterLevel !== "all") {
      const lvl = parseInt(filterLevel);
      if (!isNaN(lvl)) {
        results = results.filter((spell) => spell.level === lvl);
      }
    }

    if (filterStatus === "known") {
      results = results.filter((spell) =>
        char.knownSpells.includes(spell.index),
      );
    } else if (filterStatus === "learnable") {
      results = results.filter(
        (spell) => !char.knownSpells.includes(spell.index),
      );
    }

    if (filterSchool !== "all") {
      results = results.filter((spell) => spell.school.name === filterSchool);
    }

    if (filterDamage !== "all") {
      results = results.filter(
        (spell) => spell.mechanics?.damage_type === filterDamage,
      );
    }

    if (filterSave !== "all") {
      results = results.filter(
        (spell) => spell.mechanics?.save_ability === filterSave,
      );
    }

    return results.sort(
      (a, b) => a.name.localeCompare(b.name) || a.level - b.level,
    );
  }, [
    allSpells,
    searchTerm,
    char.maxSpellLevel,
    char.spellSources,
    char.knownSpells,
    filterLevel,
    filterStatus,
    filterSchool,
    filterDamage,
    filterSave,
  ]);

  const handleReset = () => {
    if (char.knownSpells.length === 0) return;
    if (window.confirm(currentT.grimoire.resetConfirm)) {
      batchReset(char.knownSpells);
    }
  };

  const batchReset = (spellIds: string[]) => {
    // We can use a custom action or multiple actions
    spellIds.forEach((id) => actions.forgetSpell(id));
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
          schools={schools}
          damageTypes={damageTypes}
          saveAbilities={saveAbilities}
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
