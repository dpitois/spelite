import type { ComponentChildren } from "preact";
import { Panel } from "../Panel";
import type { Translation } from "../../types/dnd";

interface BrowserHeaderProps {
  className: string;
  maxSpellLevel: number;
  isPrepareAllClass: boolean;
  knownSpellsCount: number;
  onLearnAll: () => void;
  onReset: () => void;
  t: Translation;
  children?: ComponentChildren;
}

export function BrowserHeader({
  className,
  maxSpellLevel,
  isPrepareAllClass,
  knownSpellsCount,
  onLearnAll,
  onReset,
  t,
  children,
}: BrowserHeaderProps) {
  const formatClassName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const translatedClassName =
    (t.classes as Record<string, string>)[className.toLowerCase()] || className;

  return (
    <Panel
      title={t.grimoire.title}
      titleVariant="large"
      addon={
        <>
          {isPrepareAllClass && (
            <button
              onClick={onLearnAll}
              className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              📚 Tout apprendre
            </button>
          )}
          <button
            onClick={onReset}
            disabled={knownSpellsCount === 0}
            className="text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            🗑️ {t.grimoire.resetAll}
          </button>
        </>
      }
    >
      <p className="text-sm text-slate-500 mb-6 -mt-6">
        {t.grimoire.subtitle}{" "}
        <strong>{formatClassName(translatedClassName)}</strong> (Niv Max:{" "}
        {maxSpellLevel})
      </p>
      {children}
    </Panel>
  );
}
