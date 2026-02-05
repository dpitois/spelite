import type { Spell } from "../types/dnd";
import { t } from "../store/signals";

interface SpellCardProps {
  spell: Spell;
  isKnown: boolean;
  isBonus?: boolean;
  onLearn: (id: string) => void;
  onForget: (id: string) => void;
  language: "fr" | "en";
}

export function SpellCard({
  spell,
  isKnown,
  isBonus,
  onLearn,
  onForget,
}: SpellCardProps) {
  const currentT = t.value;

  const spellLevelLabel =
    spell.level === 0
      ? currentT.common.cantrip
      : currentT.common.levelN.replace("{{n}}", spell.level.toString());

  return (
    <div
      className={`break-inside-avoid mb-4 bg-white rounded-xl border transition-all shadow-sm flex flex-col ${
        isKnown
          ? "border-blue-300 ring-1 ring-blue-100"
          : "border-slate-200 hover:border-blue-300"
      }`}
    >
      {/* Header */}
      <div className="p-4 border-b border-slate-50">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-bold text-slate-800 text-lg leading-tight">
            {spell.name}{" "}
            {isBonus && (
              <span
                className="text-amber-500 ml-1"
                title={currentT.dashboard.saveDcLabel.split(" ")[0]}
              >
                ⭐
              </span>
            )}
          </h3>
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider ${
              spell.level === 0
                ? "bg-slate-100 text-slate-600"
                : "bg-blue-100 text-blue-800"
            }`}
          >
            {spellLevelLabel}
          </span>
        </div>
        <p className="text-[11px] font-bold text-slate-400 uppercase mt-1 tracking-tight">
          {spell.school.name}
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 bg-slate-50/50 text-xs border-b border-slate-50">
        <div>
          <span className="block text-slate-400 font-bold uppercase mb-0.5 text-[10px]">
            {currentT.grimoire.castingTime}
          </span>
          <span
            className="text-slate-700 font-medium truncate block"
            title={spell.casting_time}
          >
            {spell.casting_time}
          </span>
        </div>
        <div>
          <span className="block text-slate-400 font-bold uppercase mb-0.5 text-[10px]">
            {currentT.grimoire.range}
          </span>
          <span
            className="text-slate-700 font-medium truncate block"
            title={spell.range}
          >
            {spell.range}
          </span>
        </div>
        <div>
          <span className="block text-slate-400 font-bold uppercase mb-0.5 text-[10px]">
            {currentT.grimoire.duration}
          </span>
          <span
            className="text-slate-700 font-medium truncate block"
            title={spell.duration}
          >
            {spell.concentration && "Conc., "}
            {spell.duration}
          </span>
        </div>
        <div>
          <span className="block text-slate-400 font-bold uppercase mb-0.5 text-[10px]">
            {currentT.grimoire.components}
          </span>
          <span
            className="text-slate-700 font-medium truncate block"
            title={spell.components.join(", ")}
          >
            {spell.components.join(", ")}
          </span>
        </div>
      </div>

      {/* Description */}
      <div className="p-4 flex-grow">
        <div className="prose prose-sm prose-slate max-w-none text-slate-600 leading-relaxed space-y-3">
          {spell.desc.map((paragraph, idx) => (
            <p key={idx} className="text-[13px]">
              {paragraph}
            </p>
          ))}
          {spell.material && (
            <p className="text-[11px] italic text-slate-400 border-t border-slate-100 pt-3 mt-3">
              {spell.material}
            </p>
          )}
        </div>
      </div>

      {/* Footer Action */}
      <div className="p-3 bg-slate-50 rounded-b-xl border-t border-slate-100">
        <button
          disabled={isBonus}
          onClick={() =>
            isKnown ? onForget(spell.index) : onLearn(spell.index)
          }
          className={`w-full py-2 rounded-lg text-xs font-bold transition-all shadow-sm border ${
            isBonus
              ? "bg-amber-50 text-amber-700 border-amber-200 cursor-default"
              : isKnown
                ? "bg-red-50 text-red-600 hover:bg-red-100 border-red-200"
                : "bg-indigo-600 text-white hover:bg-indigo-700 border-indigo-700"
          }`}
        >
          {isBonus
            ? `⭐ ${currentT.dashboard.ready}`
            : isKnown
              ? `🗑️ ${currentT.grimoire.forget}`
              : `✨ ${currentT.grimoire.learn}`}
        </button>
      </div>
    </div>
  );
}
