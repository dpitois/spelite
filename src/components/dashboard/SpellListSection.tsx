import { Fragment, type ComponentChildren } from "preact";
import { Panel } from "../Panel";
import type { Spell } from "../../types/dnd";
import type { Translation } from "../../types/dnd";
import { SpellRow } from "./SpellRow";

interface SpellListSectionProps {
  title: ComponentChildren;
  addon?: ComponentChildren;
  spells: Spell[];
  emptyText: string;
  description?: string;
  expandedKey: string | null;
  onToggleExpand: (key: string | null) => void;
  renderActions: (spell: Spell) => ComponentChildren;
  getIsBonus?: (spell: Spell) => boolean;
  getIsPrepared?: (spell: Spell) => boolean;
  getIsAlwaysReady?: (spell: Spell) => boolean;
  showQuickInfo?: boolean;
  prefix?: string;
  t: Translation;
  className?: string;
}

export function SpellListSection({
  title,
  addon,
  spells,
  emptyText,
  description,
  expandedKey,
  onToggleExpand,
  renderActions,
  getIsBonus,
  getIsPrepared,
  getIsAlwaysReady,
  showQuickInfo,
  prefix = "spell",
  t,
  className,
}: SpellListSectionProps) {
  return (
    <Panel
      padding="none"
      className={`overflow-hidden ${className || ""}`}
      title={title}
      addon={addon}
    >
      {description && (
        <p className="text-[10px] font-bold text-slate-500 m-4 bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 italic">
          {description}
        </p>
      )}
      <div className="divide-y divide-slate-100">
        {spells.length > 0 ? (
          (() => {
            let lastLevel = -1;
            return spells.map((spell: Spell) => {
              const showLevelHeader = spell.level !== lastLevel;
              lastLevel = spell.level;
              const itemKey = `${prefix}-${spell.index}`;
              const isExpanded = expandedKey === itemKey;

              return (
                <Fragment key={spell.index}>
                  {showLevelHeader && (
                    <div className="bg-slate-100 px-4 py-1 border-y border-slate-200/50 first:border-t-0">
                      <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider">
                        {spell.level === 0
                          ? t.common.cantrip
                          : t.common.levelN.replace(
                              "{{n}}",
                              spell.level.toString(),
                            )}
                      </span>
                    </div>
                  )}
                  <SpellRow
                    spell={spell}
                    itemKey={itemKey}
                    isExpanded={isExpanded}
                    onToggleExpand={onToggleExpand}
                    actions={renderActions(spell)}
                    isBonus={getIsBonus?.(spell)}
                    isAlwaysReady={getIsAlwaysReady?.(spell)}
                    isPrepared={getIsPrepared?.(spell)}
                    showQuickInfo={showQuickInfo}
                    t={t}
                  />
                </Fragment>
              );
            });
          })()
        ) : (
          <p className="p-8 text-center text-slate-400 text-sm italic font-bold">
            {emptyText}
          </p>
        )}
      </div>
    </Panel>
  );
}
