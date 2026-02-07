import { Fragment, type ComponentChildren } from "preact";
import type { Spell } from "../../types/dnd";
import type { Translation } from "../../types/dnd";
import { SpellAccordion } from "./SpellAccordion";

interface SpellRowProps {
  spell: Spell;
  itemKey: string;
  isExpanded: boolean;
  onToggleExpand: (key: string | null) => void;
  actions?: ComponentChildren;
  isBonus?: boolean;
  isAlwaysReady?: boolean;
  isPrepared?: boolean;
  showQuickInfo?: boolean;
  t: Translation;
}

export function SpellRow({
  spell,
  itemKey,
  isExpanded,
  onToggleExpand,
  actions,
  isBonus,
  isAlwaysReady,
  isPrepared,
  showQuickInfo,
  t,
}: SpellRowProps) {
  const isPrimary = isExpanded || isPrepared || isAlwaysReady;

  return (
    <Fragment>
      <div
        className={`py-2 px-4 flex items-center hover:bg-slate-50 group transition-colors ${isExpanded ? "bg-indigo-50/30" : ""}`}
      >
        {/* Column 1: Expand Icon */}
        <div
          className="flex shrink-0 w-5 items-center justify-center mr-3 cursor-pointer"
          onClick={() => onToggleExpand(isExpanded ? null : itemKey)}
        >
          <svg
            className={`w-3 h-3 transition-transform duration-200 ${
              isExpanded
                ? "rotate-90 text-indigo-600"
                : "text-slate-400 group-hover:text-indigo-600"
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={3}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </div>

        {/* Column 2: Name & Info */}
        <div
          className="flex-1 min-w-0 flex flex-col justify-center cursor-pointer"
          onClick={() => onToggleExpand(isExpanded ? null : itemKey)}
        >
          <div className="flex items-center gap-2">
            <span
              className={`font-bold transition-colors ${
                isPrimary
                  ? "text-indigo-600"
                  : "text-slate-600 group-hover:text-indigo-600"
              }`}
            >
              {spell.name}
            </span>
            {isBonus && (
              <span
                className="text-amber-500 text-[10px]"
                title={t.dashboard.saveDcLabel.split(" ")[0]}
              >
                ⭐
              </span>
            )}
          </div>

          {showQuickInfo && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1 text-[10px] font-bold uppercase tracking-wider">
              <span className="px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 bg-white/50">
                {spell.range}
              </span>
              <span className="px-2 py-0.5 rounded-full border border-slate-200 text-slate-500 bg-white/50 flex items-center gap-1">
                {spell.duration}
              </span>
              {spell.concentration && (
                <span
                  className="px-2 py-0.5 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50/30"
                  title={t.grimoire.concentration}
                >
                  C
                </span>
              )}
              {spell.ritual && (
                <span
                  className="px-2 py-0.5 rounded-full border border-emerald-200 text-emerald-700 bg-emerald-50/30"
                  title={t.grimoire.ritual}
                >
                  R
                </span>
              )}
              {spell.mechanics?.has_save && spell.mechanics.save_ability && (
                <span className="px-2 py-0.5 rounded-full border border-amber-200 text-amber-700 bg-amber-50/30">
                  {t.mechanics.saveLabel.substring(0, 3)}.{" "}
                  {t.mechanics.abilities[spell.mechanics.save_ability]
                    ?.substring(0, 3)
                    .toUpperCase()}
                </span>
              )}
              {spell.mechanics?.damage_dice && (
                <span className="px-2 py-0.5 rounded-full border border-indigo-200 text-indigo-700 bg-indigo-50/30">
                  {spell.mechanics.damage_dice}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Column 3: Actions */}
        <div className="flex shrink-0 items-center gap-2 ml-3">{actions}</div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded
            ? "grid-rows-[1fr] opacity-100"
            : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <SpellAccordion spell={spell} t={t} />
        </div>
      </div>
    </Fragment>
  );
}
