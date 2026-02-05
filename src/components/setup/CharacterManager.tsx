import type { JSX } from "preact";
import { Panel } from "../Panel";
import type { CharacterData, Translation } from "../../types/dnd";
import { CharacterListItem } from "./CharacterListItem";

interface CharacterManagerProps {
  activeId: string;
  savedCharacters: CharacterData[];
  onLoad: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  onExport: (id: string) => void;
  onExportAll: () => void;
  onImport: (e: JSX.TargetedEvent<HTMLInputElement, Event>) => void;
  t: Translation;
}

export function CharacterManager({
  activeId,
  savedCharacters,
  onLoad,
  onCreate,
  onDelete,
  onExport,
  onExportAll,
  onImport,
  t,
}: CharacterManagerProps) {
  return (
    <Panel
      title={t.setup.management}
      titleVariant="large"
      addon={
        <>
          <label className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs cursor-pointer hover:bg-slate-200 transition-colors uppercase">
            📥 {t.setup.import}
            <input
              type="file"
              accept=".json"
              onChange={onImport}
              className="hidden"
            />
          </label>
          <button
            onClick={onExportAll}
            className="bg-slate-100 text-slate-600 px-4 py-2 rounded-lg font-bold text-xs hover:bg-slate-200 transition-colors uppercase"
          >
            📤 {t.setup.exportAll}
          </button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onCreate}
          className="border-2 border-dashed border-slate-200 p-6 rounded-xl text-slate-400 hover:border-indigo-300 hover:text-indigo-500 transition-all group flex flex-col items-center gap-2"
        >
          <span className="text-2xl group-hover:scale-110 transition-transform">
            ➕
          </span>
          <span className="font-bold text-sm uppercase tracking-wider">
            {t.setup.createNew}
          </span>
        </button>

        {savedCharacters.map((char: CharacterData) => (
          <CharacterListItem
            key={char.id}
            char={char}
            isActive={char.id === activeId}
            onLoad={onLoad}
            onDelete={onDelete}
            onExport={onExport}
            t={t}
          />
        ))}
      </div>
    </Panel>
  );
}
