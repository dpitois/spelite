import type { Translation } from "../../types/dnd";

interface BrowserFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterLevel: string;
  setFilterLevel: (val: string) => void;
  filterClass: string;
  setFilterClass: (val: string) => void;
  onOpenFilters: () => void;
  activeFiltersCount: number;
  classes: string[];
  t: Translation;
}

export function BrowserFilters({
  searchTerm,
  setSearchTerm,
  filterLevel,
  setFilterLevel,
  filterClass,
  setFilterClass,
  onOpenFilters,
  activeFiltersCount,
  classes,
  t,
}: BrowserFiltersProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder={t.grimoire.searchPlaceholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.currentTarget.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 pl-11 h-[52px]"
          />
          <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
        </div>
        <button
          onClick={onOpenFilters}
          aria-label={t.grimoire.filters}
          className={`relative px-4 rounded-xl border-2 transition-all flex items-center justify-center min-w-[52px] h-[52px] ${
            activeFiltersCount > 0
              ? "bg-indigo-50 border-indigo-200 text-indigo-600"
              : "bg-slate-50 border-slate-100 text-slate-400 hover:border-slate-200"
          }`}
        >
          <span className="text-xl">⚙️</span>
          {activeFiltersCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Class Filter */}
        <div className="flex-1">
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.currentTarget.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm h-[48px]"
          >
            <option value="all">{t.setup.classLabel}</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {t.classes[cls] || cls}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div className="flex-1">
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.currentTarget.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm h-[48px]"
          >
            <option value="all">{t.grimoire.allLevels}</option>
            {Array.from({ length: 10 }, (_, i) => i).map((lvl) => (
              <option key={lvl} value={lvl.toString()}>
                {lvl === 0
                  ? t.common.cantrip
                  : t.common.levelN.replace("{{n}}", lvl.toString())}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
