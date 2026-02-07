import { Panel } from "../Panel";
import { SpellCard } from "../SpellCard";
import type { Spell } from "../../types/dnd";
import type { Translation } from "../../types/dnd";

interface SpellGridProps {
  spells: Spell[];
  loading: boolean;
  knownSpells: string[];
  bonusSpellIndexes: string[];
  onLearn: (id: string) => void;
  onForget: (id: string) => void;
  language: "en" | "fr";
  t: Translation;
  // Learning criteria from character
  maxSpellLevel: number;
  allowedClasses: string[];
}

export function SpellGrid({
  spells,
  loading,
  knownSpells,
  bonusSpellIndexes,
  onLearn,
  onForget,
  language,
  t,
  maxSpellLevel,
  allowedClasses,
}: SpellGridProps) {
  if (loading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-slate-500 gap-4">
        <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p>{t.common.loading}</p>
      </div>
    );
  }

  if (spells.length === 0) {
    return (
      <Panel className="text-center py-12">
        <p className="text-slate-400 font-bold italic">
          {t.grimoire.noResults}
        </p>
      </Panel>
    );
  }

  return (
    <div className="columns-1 md:columns-2 lg:columns-3 gap-4">
      {spells.map((spell) => {
        const isKnown =
          knownSpells.includes(spell.index) ||
          bonusSpellIndexes.includes(spell.index);
        const canLearn =
          spell.level <= maxSpellLevel &&
          spell.classes.some((c) => allowedClasses.includes(c.index));

        return (
          <SpellCard
            key={spell.index}
            spell={spell}
            isKnown={isKnown}
            canLearn={canLearn}
            isBonus={bonusSpellIndexes.includes(spell.index)}
            onLearn={onLearn}
            onForget={onForget}
            language={language}
          />
        );
      })}
    </div>
  );
}
