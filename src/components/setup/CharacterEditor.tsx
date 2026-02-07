import { useState, useEffect } from "preact/hooks";
import { Panel } from "../Panel";
import { AbilityScoreInput } from "./AbilityScoreInput";
import { SUBCLASSES } from "../../utils/rules";
import { classRepository, raceRepository } from "../../data";
import { language } from "../../store/signals";
import type {
  AbilityScores,
  AbilityScoreIndex,
  Class,
  Race,
} from "../../types/dnd";
import type { Translation } from "../../types/dnd";

const ABILITIES: { key: AbilityScoreIndex; label: string }[] = [
  { key: "str", label: "STR" },
  { key: "dex", label: "DEX" },
  { key: "con", label: "CON" },
  { key: "int", label: "INT" },
  { key: "wis", label: "WIS" },
  { key: "cha", label: "CHA" },
];

interface CharacterEditorProps {
  name: string;
  setName: (name: string) => void;
  className: string;
  setClassName: (className: string) => void;
  subclass: string;
  setSubclass: (subclass: string) => void;
  race: string;
  setRace: (race: string) => void;
  level: number;
  setLevel: (level: number) => void;
  hpMax: number;
  setHPMax: (hp: number) => void;
  baseAC: number;
  setBaseAC: (ac: number) => void;
  stats: AbilityScores;
  setStats: (stats: AbilityScores) => void;
  onSave: () => void;
  t: Translation;
}

export function CharacterEditor({
  name,
  setName,
  className,
  setClassName,
  subclass,
  setSubclass,
  race,
  setRace,
  level,
  setLevel,
  hpMax,
  setHPMax,
  baseAC,
  setBaseAC,
  stats,
  setStats,
  onSave,
  t,
}: CharacterEditorProps) {
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [availableRaces, setAvailableRaces] = useState<Race[]>([]);
  const currentLang = language.value;

  useEffect(() => {
    async function loadData() {
      const [classes, races] = await Promise.all([
        classRepository.getAll(currentLang),
        raceRepository.getAll(currentLang),
      ]);
      setAvailableClasses(classes);
      setAvailableRaces(races);
    }
    loadData();
  }, [currentLang]);

  return (
    <Panel title={t.setup.title} titleVariant="large">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
              {t.setup.nameLabel}
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.currentTarget.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
              {t.setup.classLabel}
            </label>
            <select
              value={className}
              onChange={(e) => {
                const selectedClass = e.currentTarget.value;
                setClassName(selectedClass);
                setSubclass("none");

                // Auto-update HP if hit die is known
                const classData = availableClasses.find(
                  (c) => c.index === selectedClass,
                );
                if (classData && level === 1) {
                  const conBonus = Math.floor((stats.con - 10) / 2);
                  setHPMax(classData.hit_die + conBonus);
                }
              }}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 capitalize"
            >
              {availableClasses.map((c) => (
                <option key={c.index} value={c.index}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {SUBCLASSES[className] && (
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                Sous-classe
              </label>
              <select
                value={subclass}
                onChange={(e) => setSubclass(e.currentTarget.value)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 capitalize"
              >
                <option value="none">Aucune</option>
                {SUBCLASSES[className].map((s) => (
                  <option key={s} value={s}>
                    {(t.classes as Record<string, string>)[s] || s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
              {t.setup.levelLabel}
            </label>
            <input
              type="number"
              min="1"
              max="20"
              value={level}
              onChange={(e) => setLevel(parseInt(e.currentTarget.value) || 1)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
            />
          </div>

          <div>
            <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
              Race
            </label>
            <select
              value={race}
              onChange={(e) => setRace(e.currentTarget.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 capitalize"
            >
              <option value="none">Aucune</option>
              {availableRaces.map((r) => (
                <option key={r.index} value={r.index}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                {t.setup.hpMaxLabel}
              </label>
              <input
                type="number"
                value={hpMax}
                onChange={(e) => setHPMax(parseInt(e.currentTarget.value) || 0)}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase text-slate-400 mb-2 tracking-widest">
                {t.setup.baseACLabel}
              </label>
              <input
                type="number"
                value={baseAC}
                onChange={(e) =>
                  setBaseAC(parseInt(e.currentTarget.value) || 0)
                }
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-12 border-t border-slate-100">
        <h3 className="text-xs font-black uppercase text-slate-400 mb-6 tracking-widest">
          {t.setup.abilitiesTitle}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {ABILITIES.map((ability) => (
            <AbilityScoreInput
              key={ability.key}
              label={ability.label}
              score={stats[ability.key]}
              onChange={(val) => setStats({ ...stats, [ability.key]: val })}
            />
          ))}
        </div>
      </div>

      <button
        onClick={onSave}
        className="w-full mt-10 bg-indigo-600 text-white font-black py-4 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 hover:-translate-y-0.5 transition-all uppercase tracking-widest text-sm"
      >
        {t.setup.updateHero}
      </button>
    </Panel>
  );
}
