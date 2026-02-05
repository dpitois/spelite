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
  t,
}: SpellRowProps) {
  const isPrimary = isExpanded || isPrepared || isAlwaysReady;

  return (
    <Fragment>
      <div
        className={`py-2 px-4 flex justify-between items-center hover:bg-slate-50 group transition-colors ${isExpanded ? "bg-indigo-50/30" : ""}`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center gap-2 cursor-pointer group/name`}
            onClick={() => onToggleExpand(isExpanded ? null : itemKey)}
          >
            <svg
              className={`w-3 h-3 transition-transform duration-200 ${
                isExpanded ? "rotate-90 text-indigo-600" : "text-slate-400 group-hover/name:text-indigo-600"
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
            <span
              className={`font-bold transition-colors ${
                isPrimary
                  ? "text-indigo-600"
                  : "text-slate-600 group-hover/name:text-indigo-600"
              }`}
            >
              {spell.name}
            </span>
          </div>
          {isBonus && (
            <span
              className="text-amber-500"
              title={t.dashboard.saveDcLabel.split(" ")[0]}
            >
              ⭐
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">{actions}</div>
      </div>
      <div
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <SpellAccordion spell={spell} t={t} />
        </div>
      </div>
    </Fragment>
  );
}
