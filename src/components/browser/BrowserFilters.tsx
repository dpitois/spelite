import type { Translation } from "../../types/dnd";

interface BrowserFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterLevel: string;
  setFilterLevel: (val: string) => void;
  filterClass: string;
  setFilterClass: (val: string) => void;
  filterSchool: string;
  setFilterSchool: (val: string) => void;
  filterStatus: "all" | "known" | "learnable";
  setFilterStatus: (val: "all" | "known" | "learnable") => void;
  filterDamage: string;
  setFilterDamage: (val: string) => void;
  filterSave: string;
  setFilterSave: (val: string) => void;
  classes: string[];
  schools: string[];
  damageTypes: string[];
  saveAbilities: string[];
  t: Translation;
}

export function BrowserFilters({
  searchTerm,
  setSearchTerm,
  filterLevel,
  setFilterLevel,
  filterClass,
  setFilterClass,
  filterSchool,
  setFilterSchool,
  filterStatus,
  setFilterStatus,
  filterDamage,
  setFilterDamage,
  filterSave,
  setFilterSave,
  classes,
  schools,
  damageTypes,
  saveAbilities,
  t,
}: BrowserFiltersProps) {
  return (
    <div className="space-y-4 mt-6">
      <div className="relative">
        <input
          type="text"
          placeholder={t.grimoire.searchPlaceholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.currentTarget.value)}
          className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-3 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 pl-11"
        />
        <span className="absolute left-4 top-3.5 text-slate-400">🔍</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Class Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest pl-1">
            {t.setup.classLabel}
          </label>
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.currentTarget.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
          >
            <option value="all">{t.common.all}</option>
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {t.classes[cls] || cls}
              </option>
            ))}
          </select>
        </div>

        {/* Level Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest pl-1">
            {t.common.level}
          </label>
          <select
            value={filterLevel}
            onChange={(e) => setFilterLevel(e.currentTarget.value)}
            className="w-full bg-slate-50 border-2 border-slate-100 rounded-xl px-4 py-2.5 focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold text-slate-700 text-sm"
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

        {/* School Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest pl-1">
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
        </div>

        {/* Status Filter */}
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest pl-1">
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
        </div>
      </div>

      {/* Advanced Ontology Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest pl-1">
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
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-slate-400 mb-1.5 tracking-widest pl-1">
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
        </div>
      </div>
    </div>
  );
}
