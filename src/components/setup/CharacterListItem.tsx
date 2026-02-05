import type { CharacterData } from "../../types/dnd";
import type { Translation } from "../../types/dnd";

interface CharacterListItemProps {
  char: CharacterData;
  isActive: boolean;
  onLoad: (id: string) => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  t: Translation;
}

export function CharacterListItem({
  char,
  isActive,
  onLoad,
  onDelete,
  onExport,
  t,
}: CharacterListItemProps) {
  return (
    <div
      className={`p-5 rounded-xl border-2 transition-all flex justify-between items-center ${
        isActive
          ? "border-indigo-500 bg-indigo-50/30"
          : "border-slate-100 bg-slate-50/50"
      }`}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="font-black text-slate-800">{char.name}</span>
          {isActive && (
            <span className="bg-indigo-500 text-white text-[8px] font-black px-1.5 py-0.5 rounded uppercase">
              {t.setup.active}
            </span>
          )}
        </div>
        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
          {(t.races as Record<string, string>)?.[char.race] || char.race} •{" "}
          {(t.classes as Record<string, string>)[
            char.className.toLowerCase()
          ] || char.className}{" "}
          {char.subclass !== "none"
            ? `(${(t.classes as Record<string, string>)[char.subclass] || char.subclass})`
            : ""}{" "}
          • {t.common.level} {char.level}
        </p>
      </div>

      <div className="flex gap-1">
        <button
          onClick={() => onExport(char.id)}
          className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
          title="Exporter"
        >
          📤
        </button>
        {!isActive && (
          <button
            onClick={() => onLoad(char.id)}
            className="bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-lg font-bold text-[10px] hover:border-indigo-300 hover:text-indigo-600 transition-all uppercase"
          >
            {t.setup.load}
          </button>
        )}
        <button
          onClick={() => {
            if (confirm(t.setup.deleteConfirm)) onDelete(char.id);
          }}
          className="p-2 text-slate-300 hover:text-red-600 transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
