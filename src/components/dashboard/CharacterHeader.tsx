import { Panel } from "../Panel";
import { StatBox } from "../StatBox";
import { Character } from "../../models/Character";
import type { Translation } from "../../types/dnd";

interface CharacterHeaderProps {
  char: Character;
  t: Translation;
}

const getClassEmoji = (cls: string) => {
  const c = (cls || "").toLowerCase();
  if (c.includes("barbar")) return "🪓";
  if (c.includes("bard")) return "🎻";
  if (c.includes("cleric") || c.includes("clerc")) return "⚕️";
  if (c.includes("druid")) return "🌿";
  if (c.includes("fighter") || c.includes("guerrier")) return "⚔️";
  if (c.includes("monk") || c.includes("moine")) return "🧘";
  if (c.includes("paladin")) return "🛡️";
  if (c.includes("ranger") || c.includes("rôdeur")) return "🏹";
  if (c.includes("rogue") || c.includes("roublard")) return "🗡️";
  if (c.includes("sorcerer") || c.includes("ensorceleur")) return "🎇";
  if (c.includes("warlock") || c.includes("occultiste")) return "👁️";
  if (c.includes("wizard") || c.includes("magicien")) return "🧙‍♂️";
  if (c.includes("artificer") || c.includes("artificier")) return "🔧";
  return "🧙‍♂️";
};

export function CharacterHeader({ char, t }: CharacterHeaderProps) {
  const translatedClassName =
    (t.classes as Record<string, string>)[char.className.toLowerCase()] ||
    char.className;

  return (
    <Panel contentClassName="flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center text-3xl">
          {getClassEmoji(char.className)}
        </div>
        <div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">
            {char.name}
          </h2>
          <p className="text-slate-500 uppercase text-[10px] font-bold tracking-widest">
            {translatedClassName}{" "}
            {t.common.levelN.replace("{{n}}", char.level.toString())}
          </p>
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-3">
        <StatBox variant="large" label={t.dashboard.acLabel} value={char.ac} />
        <StatBox
          variant="large"
          label={t.dashboard.initLabel}
          value={char.initiative >= 0 ? `+${char.initiative}` : char.initiative}
        />
        <StatBox
          variant="large"
          label={t.dashboard.profLabel}
          value={`+${char.proficiencyBonus}`}
        />
        <StatBox
          variant="accent"
          label={t.dashboard.saveDcLabel}
          value={char.spellSaveDC}
        />
        <StatBox
          variant="accent"
          label={t.dashboard.atkBonusLabel}
          value={`+${char.spellAttackBonus}`}
        />
      </div>
      <div className="flex gap-2">
        <button
          onClick={() => char.takeLongRest(t)}
          className="px-4 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-lg font-bold text-xs hover:bg-amber-100 transition-colors uppercase tracking-widest"
        >
          ☀️ {t.dashboard.longRest}
        </button>
      </div>
    </Panel>
  );
}
