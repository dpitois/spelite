import type { Spell } from "../../types/dnd";
import type { Translation } from "../../types/dnd";

interface SpellAccordionProps {
  spell: Spell;
  t: Translation;
}

export function SpellAccordion({ spell, t }: SpellAccordionProps) {
  return (
    <div className="px-4 pb-4 pt-2 bg-slate-50/80 border-t border-slate-100">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-2 mb-4 text-[11px]">
        <div className="flex flex-wrap items-baseline gap-1.5 sm:col-span-2">
          <span className="text-slate-500 font-black uppercase tracking-tighter shrink-0">
            {t.grimoire.castingTime} :
          </span>
          <span className="text-slate-900 font-bold">
            {spell.casting_time}
            {spell.ritual && (
              <span className="ml-1 text-emerald-600">
                ({t.grimoire.ritual})
              </span>
            )}
          </span>
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5 sm:col-span-1">
          <span className="text-slate-500 font-black uppercase tracking-tighter shrink-0">
            {t.grimoire.range} :
          </span>
          <span className="text-slate-900 font-bold">{spell.range}</span>
        </div>
        <div className="sm:col-span-2">
          <div className="flex flex-wrap items-baseline gap-1.5">
            <span className="text-slate-500 font-black uppercase tracking-tighter shrink-0">
              {t.grimoire.components} :
            </span>
            <span className="text-slate-900 font-bold">
              {spell.components.join(", ")}
            </span>
          </div>
          {spell.material && (
            <span className="block text-[12px] font-medium text-slate-500 italic leading-tight mt-0.5">
              ({spell.material})
            </span>
          )}
        </div>
        <div className="flex flex-wrap items-baseline gap-1.5 sm:col-span-1">
          <span className="text-slate-500 font-black uppercase tracking-tighter shrink-0">
            {t.grimoire.duration} :
          </span>
          <span className="text-slate-900 font-bold">
            {spell.duration}
            {spell.concentration && (
              <span className="block text-[10px] font-medium text-slate-500 italic leading-tight mt-0.5">
                {t.grimoire.concentration}
              </span>
            )}
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
