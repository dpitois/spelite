import { useState, useEffect } from "preact/hooks";
import { dbAdmin, type DBStats } from "../utils/dbAdmin";
import { Panel } from "../components/Panel";
import { t } from "../store/signals";

export function Settings() {
  const currentT = t.value;
  const [stats, setStats] = useState<DBStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    dbAdmin.getStats().then(setStats);
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((k) => k + 1);
  };

  const handleClearEmbeddings = async () => {
    if (!window.confirm(currentT.admin.clearConfirm)) {
      return;
    }
    setLoading(true);
    try {
      await dbAdmin.clearEmbeddings();
      handleRefresh();
    } catch (e) {
      console.error(e);
      alert("Erreur lors du nettoyage.");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDB = async () => {
    if (window.confirm(currentT.admin.resetConfirm1)) {
      if (window.confirm(currentT.admin.resetConfirm2)) {
        setLoading(true);
        await dbAdmin.deleteDatabase();
      }
    }
  };

  const formatBytes = (bytes?: number) => {
    if (bytes === undefined || bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <Panel title={currentT.admin.title} titleVariant="large">
      <div className="space-y-10">
        {/* Stats Section */}
        <section className="space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">
              {currentT.admin.dbStatus}
            </h4>
            <button
              onClick={handleRefresh}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors uppercase tracking-widest"
            >
              {currentT.admin.refresh}
            </button>
          </div>

          {stats ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                  {currentT.admin.triplets}
                </span>
                <span className="text-xl font-black text-slate-700">
                  {stats.tripletsCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                  {currentT.admin.embeddings}
                </span>
                <span
                  className={`text-xl font-black ${stats.embeddingsCount < 10 ? "text-red-500" : "text-slate-700"}`}
                >
                  {stats.embeddingsCount}
                </span>
              </div>
              <div>
                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1">
                  {currentT.admin.storage}
                </span>
                <span className="text-xl font-black text-slate-700">
                  {formatBytes(stats.storageUsage)}
                </span>
              </div>
              <div className="flex flex-col gap-1">
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {currentT.admin.data}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    {stats.dataVersion}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] font-black text-slate-400 uppercase tracking-tighter">
                    {currentT.admin.schema}
                  </span>
                  <span className="text-xs font-bold text-slate-600">
                    v{stats.dbVersion}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-16 bg-slate-50 animate-pulse rounded-xl" />
          )}
        </section>

        {/* Actions Section */}
        <section className="space-y-4">
          <h4 className="text-xs font-black uppercase text-slate-400 tracking-widest">
            {currentT.admin.actionsTitle}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={handleClearEmbeddings}
              disabled={loading}
              className="group flex flex-col items-start p-5 bg-slate-50 hover:bg-amber-50 border-2 border-slate-100 hover:border-amber-200 rounded-2xl transition-all text-left"
            >
              <span className="font-black text-slate-700 group-hover:text-amber-700 uppercase text-xs tracking-wider mb-1">
                🗑️ {currentT.admin.clearAI}
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-amber-600 uppercase tracking-tight">
                {currentT.admin.clearAIDesc}
              </span>
            </button>

            <button
              onClick={handleDeleteDB}
              disabled={loading}
              className="group flex flex-col items-start p-5 bg-slate-50 hover:bg-red-50 border-2 border-slate-100 hover:border-red-200 rounded-2xl transition-all text-left"
            >
              <span className="font-black text-slate-700 group-hover:text-red-700 uppercase text-xs tracking-wider mb-1">
                ⚠️ {currentT.admin.factoryReset}
              </span>
              <span className="text-[10px] font-bold text-slate-400 group-hover:text-red-600 uppercase tracking-tight">
                {currentT.admin.factoryResetDesc}
              </span>
            </button>
          </div>
        </section>

        <p className="text-center text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] pt-4">
          Spelite v0.0.1 • Local Storage Maintenance
        </p>
      </div>
    </Panel>
  );
}
