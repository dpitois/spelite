import { signal } from "@preact/signals";
import { useState, useEffect, useMemo } from "preact/hooks";
import { t, language, actions } from "../store/signals";
import { useCharacter } from "../hooks/useCharacter";
import { spellRepository } from "../data";
import { CharacterHeader } from "../components/dashboard/CharacterHeader";
import { AbilityScoresGrid } from "../components/dashboard/AbilityScoresGrid";
import { HealthPanel } from "../components/dashboard/HealthPanel";
import { SpellSlotsGrid } from "../components/dashboard/SpellSlotsGrid";
import { SpellListSection } from "../components/dashboard/SpellListSection";
import type { SpellDictionary } from "../types/dnd";

const isInitialLoad = signal(true);

export function Dashboard() {
  const char = useCharacter();
  const currentLang = language.value;
  const currentT = t.value;

  const [spellDetails, setSpellDetails] = useState<SpellDictionary>({});
  const [loading, setLoading] = useState(true);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);

  const preparedList = useMemo(
    () => char.getPreparedSpellsList(spellDetails),
    [char, spellDetails],
  );
  const knownList = useMemo(
    () => char.getKnownSpellsList(spellDetails),
    [char, spellDetails],
  );
  const manualPreparedCount = useMemo(
    () => char.getManualPreparedCount(spellDetails),
    [char, spellDetails],
  );

  useEffect(() => {
    let mounted = true;

    async function loadData() {
      // Only show full loading spinner if we don't have any details yet (initial load)
      if (isInitialLoad.value) {
        setLoading(true);
        isInitialLoad.value = false;
      }

      const allSpells = await spellRepository.getAll(currentLang);
      if (!mounted) return;

      const details: SpellDictionary = {};
      const relevantIds = new Set([
        ...char.knownSpells,
        ...char.preparedSpells,
        ...char.bonusSpellIndexes,
      ]);
      relevantIds.forEach((id) => {
        const spell = allSpells.find((s) => s.index === id);
        if (spell) details[id] = spell;
      });

      setSpellDetails(details);
      setLoading(false);
    }
    loadData();
    return () => {
      mounted = false;
    };
  }, [
    char.knownSpells,
    char.preparedSpells,
    char.bonusSpellIndexes,
    currentLang,
  ]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p>{currentT.common.loading}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CharacterHeader char={char} t={currentT} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <AbilityScoresGrid
          stats={char.stats}
          t={currentT}
          className="lg:col-span-2"
        />
        <HealthPanel
          hp={char.hp}
          updateHP={(val) => char.updateHP(val)}
          t={currentT}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <SpellSlotsGrid
          slots={char.slots}
          usedSlots={char.usedSlots}
          setUsedSlots={actions.setUsedSlots}
          t={currentT}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {char.maxPreparedSpells > 0 && (
          <SpellListSection
            title={currentT.dashboard.preparedTitle}
            addon={
              <span className="text-indigo-600">
                {manualPreparedCount} / {char.maxPreparedSpells}{" "}
                {char.bonusSpellIndexes.length > 0 && (
                  <span className="text-slate-300 ml-1 text-[10px] tracking-normal lowercase font-bold">
                    (+ {char.bonusSpellIndexes.length}{" "}
                    {currentT.dashboard.saveDcLabel.split(" ")[0]})
                  </span>
                )}
              </span>
            }
            spells={preparedList}
            emptyText={currentT.dashboard.noPrepared}
            expandedKey={expandedKey}
            onToggleExpand={setExpandedKey}
            prefix="prepared"
            t={currentT}
            getIsBonus={(s) => char.bonusSpellIndexes.includes(s.index)}
            renderActions={(spell) => (
              <div className="flex items-center gap-2">
                {!char.bonusSpellIndexes.includes(spell.index) && (
                  <button
                    onClick={() => actions.unprepareSpell(spell.index)}
                    className="text-slate-300 hover:text-red-500 p-2 transition-colors"
                  >
                    ✕
                  </button>
                )}
                {spell.level > 0 && (
                  <button
                    onClick={() => char.castSpell(spell, currentT)}
                    disabled={
                      (char.usedSlots[spell.level] || 0) >=
                      (char.slots[spell.level - 1] || 0)
                    }
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${(char.usedSlots[spell.level] || 0) < (char.slots[spell.level - 1] || 0) ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-sm" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}
                  >
                    {currentT.dashboard.cast}
                  </button>
                )}
              </div>
            )}
          />
        )}

        <SpellListSection
          className={char.maxPreparedSpells <= 0 ? "lg:col-span-2" : ""}
          title={
            char.maxPreparedSpells > 0
              ? currentT.dashboard.knownTitle
              : currentT.dashboard.spontaneousTitle
          }
          description={
            char.maxPreparedSpells <= 0 && knownList.length > 0
              ? currentT.dashboard.spontaneousDesc.replace(
                  "{{className}}",
                  (currentT.classes as Record<string, string>)[
                    char.className.toLowerCase()
                  ] || char.className,
                )
              : undefined
          }
          spells={knownList}
          emptyText={currentT.dashboard.noKnown}
          expandedKey={expandedKey}
          onToggleExpand={setExpandedKey}
          prefix="known"
          t={currentT}
          getIsBonus={(s) => char.bonusSpellIndexes.includes(s.index)}
          getIsPrepared={(s) => char.preparedSpells.includes(s.index)}
          getIsAlwaysReady={(s) =>
            s.level === 0 || char.bonusSpellIndexes.includes(s.index)
          }
          renderActions={(spell) => {
            const isPrepared = char.preparedSpells.includes(spell.index);
            const canPrepare = char.maxPreparedSpells > 0;
            const isAlwaysReady =
              spell.level === 0 || char.bonusSpellIndexes.includes(spell.index);
            const canCast =
              !canPrepare &&
              (spell.level === 0 ||
                (char.usedSlots[spell.level] || 0) <
                  (char.slots[spell.level - 1] || 0));

            return (
              <div className="flex items-center gap-2">
                {!canPrepare && spell.level > 0 && (
                  <button
                    onClick={() => char.castSpell(spell, currentT)}
                    disabled={!canCast}
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${canCast ? "bg-indigo-600 text-white border-indigo-700 hover:bg-indigo-700 shadow-sm" : "bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed"}`}
                  >
                    {currentT.dashboard.cast}
                  </button>
                )}
                {canPrepare && !isAlwaysReady && (
                  <button
                    onClick={() =>
                      char.togglePrepareSpell(spell, spellDetails, currentT)
                    }
                    className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${isPrepared ? "bg-indigo-50 text-indigo-700 border-indigo-200 shadow-inner" : "bg-white text-slate-400 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"}`}
                  >
                    {isPrepared
                      ? currentT.dashboard.ready
                      : currentT.dashboard.prepare}
                  </button>
                )}
                {canPrepare && isAlwaysReady && (
                  <span className="px-3 py-1.5 text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 rounded-xl border border-indigo-100">
                    {currentT.dashboard.ready}
                  </span>
                )}
              </div>
            );
          }}
        />
      </div>
    </div>
  );
}
