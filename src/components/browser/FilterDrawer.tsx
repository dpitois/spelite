import type { Translation } from "../../types/dnd";
import type { SortOption } from "../../utils/spellSorting";

interface FilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  filterSchool: string;
  setFilterSchool: (val: string) => void;
  filterStatus: "all" | "known" | "learnable";
  setFilterStatus: (val: "all" | "known" | "learnable") => void;
  filterDamage: string;
  setFilterDamage: (val: string) => void;
  filterSave: string;
  setFilterSave: (val: string) => void;
  filterAction: string;
  setFilterAction: (val: string) => void;
  sortBy: SortOption;
  setSortBy: (val: SortOption) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (val: "asc" | "desc") => void;
  schools: string[];
  damageTypes: string[];
  saveAbilities: string[];
  onReset: () => void;
  t: Translation;
}

export function FilterDrawer({
  isOpen,
  onClose,
  filterSchool,
  setFilterSchool,
  filterStatus,
  setFilterStatus,
  filterDamage,
  setFilterDamage,
  filterSave,
  setFilterSave,
  filterAction,
  setFilterAction,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  schools,
  damageTypes,
  saveAbilities,
  onReset,
  t,
}: FilterDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Content */}
      <div className="relative w-full max-w-xs bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              {t.grimoire.filters}
            </h2>
            <button
              onClick={onReset}
              className="text-[10px] font-black uppercase text-indigo-600 hover:text-indigo-800 transition-colors bg-indigo-50 px-2 py-1 rounded-md"
            >
              {t.common.reset}
            </button>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8">
          {/* Sorting */}
          <section className="space-y-4">
            <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest">
              {t.grimoire.sortBy}
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {(["name", "level", "range", "duration"] as SortOption[]).map(
                (opt) => (
                  <button
                    key={opt}
                    onClick={() => setSortBy(opt)}
                    className={`px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                      sortBy === opt
                        ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                        : "bg-white border-slate-100 text-slate-500 hover:border-slate-200"
                    }`}
                  >
                    {t.grimoire[opt] || opt}
                  </button>
                ),
              )}
            </div>
            <div className="flex bg-slate-50 p-1 rounded-xl">
              <button
                onClick={() => setSortOrder("asc")}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                  sortOrder === "asc"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                {t.grimoire.asc}
              </button>
              <button
                onClick={() => setSortOrder("desc")}
                className={`flex-1 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-tighter transition-all ${
                  sortOrder === "desc"
                    ? "bg-white shadow-sm text-indigo-600"
                    : "text-slate-400"
                }`}
              >
                {t.grimoire.desc}
              </button>
            </div>
          </section>

          {/* Action Type */}
          <section className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {t.grimoire.actionType}
            </label>
            <select
              value={filterAction}
              onChange={(e) => setFilterAction(e.currentTarget.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
            >
              <option value="all">{t.grimoire.anyAction}</option>
              <option value="action">{t.grimoire.action}</option>
              <option value="bonus">{t.grimoire.bonus}</option>
              <option value="reaction">{t.grimoire.reaction}</option>
            </select>
          </section>

          {/* School Filter */}
          <section className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {t.grimoire.schoolFilter}
            </label>
            <select
              value={filterSchool}
              onChange={(e) => setFilterSchool(e.currentTarget.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
            >
              <option value="all">{t.grimoire.allSchools}</option>
              {schools.map((school) => (
                <option key={school} value={school}>
                  {school}
                </option>
              ))}
            </select>
          </section>

          {/* Status Filter */}
          <section className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {t.grimoire.statusFilter}
            </label>
            <select
              value={filterStatus}
              onChange={(e) =>
                setFilterStatus(
                  e.currentTarget.value as "all" | "known" | "learnable",
                )
              }
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
            >
              <option value="all">{t.grimoire.allStatus}</option>
              <option value="known">{t.grimoire.known}</option>
              <option value="learnable">{t.grimoire.learnable}</option>
            </select>
          </section>

          {/* Damage Type */}
          <section className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {t.mechanics.damageLabel}
            </label>
            <select
              value={filterDamage}
              onChange={(e) => setFilterDamage(e.currentTarget.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
            >
              <option value="all">{t.mechanics.allTypes}</option>
              {damageTypes.map((type) => (
                <option key={type} value={type}>
                  {t.mechanics.damageTypes[type] || type}
                </option>
              ))}
            </select>
          </section>

          {/* Saving Throw */}
          <section className="space-y-3">
            <label className="block text-[10px] font-black uppercase text-slate-400 tracking-widest">
              {t.mechanics.saveLabel}
            </label>
            <select
              value={filterSave}
              onChange={(e) => setFilterSave(e.currentTarget.value)}
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
            >
              <option value="all">{t.mechanics.allAbilities}</option>
              {saveAbilities.map((ability) => (
                <option key={ability} value={ability}>
                  {t.mechanics.abilities[ability] || ability.toUpperCase()}
                </option>
              ))}
            </select>
          </section>
        </div>

        <div className="p-6 border-t border-slate-100">
          <button
            onClick={onClose}
            className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200"
          >
            {t.common.confirm}
          </button>
        </div>
      </div>
    </div>
  );
}
