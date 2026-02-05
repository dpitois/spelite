import type { Spell } from "../../types/dnd";
import type { Translation } from "../../types/dnd";

interface SpellAccordionProps {
  spell: Spell;
  t: Translation;
}

export function SpellAccordion({ spell, t }: SpellAccordionProps) {
  return (
    <div className="px-4 pb-4 pt-2 bg-slate-50/80 border-t border-slate-100">
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4 text-[11px]">
        <div>
          <span className="block text-slate-400 font-black uppercase mb-0.5 tracking-tighter">
            {t.grimoire.castingTime}
          </span>
          <span className="text-slate-700 font-bold">{spell.casting_time}</span>
        </div>
        <div>
          <span className="block text-slate-400 font-black uppercase mb-0.5 tracking-tighter">
            {t.grimoire.range}
          </span>
          <span className="text-slate-700 font-bold">{spell.range}</span>
        </div>
        <div>
          <span className="block text-slate-400 font-black uppercase mb-0.5 tracking-tighter">
            {t.grimoire.components}
          </span>
          <span className="text-slate-700 font-bold">
            {spell.components.join(", ")}
            {spell.material && (
              <span className="block text-[10px] font-medium text-slate-500 italic leading-tight mt-0.5">
                ({spell.material})
              </span>
            )}
          </span>
        </div>
        <div>
          <span className="block text-slate-400 font-black uppercase mb-0.5 tracking-tighter">
            {t.grimoire.duration}
          </span>
          <span className="text-slate-700 font-bold">
            {spell.concentration && `${t.grimoire.concentration}, `}
            {spell.duration}
          </span>
        </div>
      </div>
      <div className="space-y-2">
        {spell.desc.map((paragraph, idx) => (
          <p key={idx} className="text-xs leading-relaxed text-slate-600">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  );
}
