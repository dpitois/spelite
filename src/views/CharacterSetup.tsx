import type { JSX } from "preact";
import { useState, useEffect } from "preact/hooks";
import {
  activeCharacterId,
  characterName,
  className as storeClassSignal,
  subclass as storeSubclassSignal,
  race as storeRaceSignal,
  level as storeLevelSignal,
  stats as storeStatsSignal,
  hp as storeHPSignal,
  baseAC as storeBaseACSignal,
  savedCharacters,
  t,
  actions,
} from "../store/signals";
import { CharacterManager } from "../components/setup/CharacterManager";
import { CharacterEditor } from "../components/setup/CharacterEditor";

export function CharacterSetup() {
  const currentT = t.value;
  const storeId = activeCharacterId.value;

  const [activeTab, setActiveTab] = useState<"edit" | "manage">("edit");
  const [name, setLocalName] = useState(characterName.value);
  const [className, setLocalClass] = useState(storeClassSignal.value);
  const [subclass, setLocalSubclass] = useState(storeSubclassSignal.value);
  const [race, setLocalRace] = useState(storeRaceSignal.value);
  const [level, setLocalLevel] = useState(storeLevelSignal.value);
  const [stats, setLocalStats] = useState(storeStatsSignal.value);
  const [hpMax, setLocalHPMax] = useState(storeHPSignal.value.max);
  const [baseAC, setLocalBaseAC] = useState(storeBaseACSignal.value);

  // Sync local state when the active character changes in the store
  useEffect(() => {
    setLocalName(characterName.value);
    setLocalClass(storeClassSignal.value);
    setLocalSubclass(storeSubclassSignal.value);
    setLocalRace(storeRaceSignal.value);
    setLocalLevel(storeLevelSignal.value);
    setLocalStats(storeStatsSignal.value);
    setLocalHPMax(storeHPSignal.value.max);
    setLocalBaseAC(storeBaseACSignal.value);
  }, [storeId]); // Only re-sync when changing to a different character

  const handleSave = () => {
    actions.setName(name);
    actions.setClassName(className);
    actions.setSubclass(subclass);
    actions.setRace(race);
    actions.setLevel(level);
    actions.setStats(stats);
    actions.setHP({
      max: hpMax,
      current: Math.min(storeHPSignal.value.current, hpMax),
    });
    actions.setBaseAC(baseAC);
    // saveCharacter() is now handled automatically by signals effects
  };

  const handleImport = (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
    const file = e.currentTarget.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = actions.importCharacters(e.target?.result as string);
      alert(result.message);
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex gap-4 mb-2">
        <button
          onClick={() => setActiveTab("edit")}
          className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === "edit"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-white text-slate-400 border border-slate-200 hover:border-indigo-300"
          }`}
        >
          {currentT.setup.editTab}
        </button>
        <button
          onClick={() => setActiveTab("manage")}
          className={`px-6 py-3 rounded-xl font-black text-sm uppercase tracking-widest transition-all ${
            activeTab === "manage"
              ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
              : "bg-white text-slate-400 border border-slate-200 hover:border-indigo-300"
          }`}
        >
          {currentT.setup.manageTab}
        </button>
      </div>

      {activeTab === "edit" && (
        <CharacterEditor
          name={name}
          setName={setLocalName}
          className={className}
          setClassName={setLocalClass}
          subclass={subclass}
          setSubclass={setLocalSubclass}
          race={race}
          setRace={setLocalRace}
          level={level}
          setLevel={setLocalLevel}
          hpMax={hpMax}
          setHPMax={setLocalHPMax}
          baseAC={baseAC}
          setBaseAC={setLocalBaseAC}
          stats={stats}
          setStats={setLocalStats}
          onSave={handleSave}
          t={currentT}
        />
      )}

      {activeTab === "manage" && (
        <CharacterManager
          activeId={storeId}
          savedCharacters={savedCharacters.value}
          onLoad={actions.loadCharacter}
          onCreate={actions.createCharacter}
          onDelete={actions.deleteCharacter}
          onExport={actions.exportCharacter}
          onExportAll={actions.exportAllCharacters}
          onImport={handleImport}
          t={currentT}
        />
      )}
    </div>
  );
}
