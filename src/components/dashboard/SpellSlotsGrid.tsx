import { Panel } from "../Panel";
import type { Translation } from "../../types/dnd";
import type { UsedSlotsState } from "../../types/dnd";

interface SpellSlotsGridProps {
  slots: number[];
  usedSlots: UsedSlotsState;
  setUsedSlots: (level: number, used: number) => void;
  t: Translation;
}

export function SpellSlotsGrid({
  slots,
  usedSlots,
  setUsedSlots,
  t,
}: SpellSlotsGridProps) {
  if (slots.length === 0) {
    return (
      <p className="col-span-full text-center text-slate-400 py-8 bg-slate-50 rounded-2xl border border-slate-200 border-dashed text-sm font-bold italic">
        {t.dashboard.noSlots}
      </p>
    );
  }

  return (
    <>
      {slots.map((total, index) => {
        const spellLevel = index + 1;
        const used = usedSlots[spellLevel] || 0;
        const remaining = Math.max(0, total - used);
        return (
          <Panel
            key={spellLevel}
            title={t.common.levelN.replace("{{n}}", spellLevel.toString())}
            titleVariant="default"
            addon={
              <span className="text-[10px] font-black text-slate-400 uppercase">
                {remaining} / {total}
              </span>
            }
          >
            <div className="flex flex-wrap gap-1.5">
              {Array.from({ length: total }).map((_, i) => {
                const isUsed = i < used;
                return (
                  <button
                    key={i}
                    onClick={() => setUsedSlots(spellLevel, isUsed ? i : i + 1)}
                    className={`w-8 h-8 rounded-lg border-2 transition-all flex items-center justify-center text-xs font-black ${
                      isUsed
                        ? "bg-red-50 border-red-200 text-red-500 shadow-inner"
                        : "bg-white border-slate-200 text-slate-300 hover:border-indigo-300 hover:text-indigo-400"
                    }`}
                  >
                    {isUsed ? "✕" : i + 1}
                  </button>
                );
              })}
            </div>
          </Panel>
        );
      })}
    </>
  );
}
