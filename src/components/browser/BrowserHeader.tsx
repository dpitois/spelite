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
  isModelReady?: boolean;
  aiSearchEnabled?: boolean;
  onToggleAI?: (enabled: boolean) => void;
  indexingProgress?: number;
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
  isModelReady,
  aiSearchEnabled,
  onToggleAI,
  indexingProgress = 0,
}: BrowserHeaderProps) {
  const formatClassName = (name: string) => {
    return name.charAt(0).toUpperCase() + name.slice(1);
  };

  const translatedClassName =
    (t.classes as Record<string, string>)[className.toLowerCase()] || className;

  const getAIBadgeContent = () => {
    if (!aiSearchEnabled) return t.grimoire.semanticActivate;
    if (isModelReady && indexingProgress >= 100)
      return t.grimoire.semanticReady;
    if (isModelReady && indexingProgress > 0)
      return t.grimoire.semanticIndexing.replace(
        "{{p}}",
        indexingProgress.toString(),
      );
    return t.grimoire.semanticDownloading;
  };

  return (
    <Panel
      title={t.grimoire.title}
      titleVariant="large"
      addon={
        <div className="flex items-center gap-2">
          <button
            onClick={() => onToggleAI?.(!aiSearchEnabled)}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider border transition-all duration-500 ${
              aiSearchEnabled
                ? isModelReady && indexingProgress >= 100
                  ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                  : "bg-amber-50 text-amber-600 border-amber-100 animate-pulse"
                : "bg-slate-50 text-slate-400 border-slate-100 hover:bg-slate-100 hover:text-slate-600 transition-colors"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                aiSearchEnabled
                  ? isModelReady && indexingProgress >= 100
                    ? "bg-emerald-500"
                    : "bg-amber-500"
                  : "bg-slate-300"
              }`}
            />
            <span className="hidden sm:inline">{getAIBadgeContent()}</span>
            <span className="sm:hidden">AI</span>
          </button>
          {isPrepareAllClass && (
            <button
              onClick={onLearnAll}
              className="text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-600 border border-indigo-100 hover:bg-indigo-100 transition-colors"
            >
              <span className="hidden sm:inline">📚 {t.grimoire.learnAll}</span>
              <span className="sm:hidden">📚 {t.grimoire.learnAllShort}</span>
            </button>
          )}
          <button
            onClick={onReset}
            disabled={knownSpellsCount === 0}
            className="text-[10px] font-black uppercase tracking-widest px-2 sm:px-3 py-1.5 rounded-lg text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <span className="hidden sm:inline">🗑️ {t.grimoire.resetAll}</span>
            <span className="sm:hidden">🗑️ {t.grimoire.resetShort}</span>
          </button>
        </div>
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
