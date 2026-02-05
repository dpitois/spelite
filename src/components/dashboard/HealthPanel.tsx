import { Panel } from "../Panel";
import type { Translation } from "../../types/dnd";

interface HealthPanelProps {
  hp: {
    current: number;
    max: number;
  };
  updateHP: (value: number) => void;
  t: Translation;
}

export function HealthPanel({ hp, updateHP, t }: HealthPanelProps) {
  const hpPercent = (hp.current / hp.max) * 100;

  const getBarColor = (pct: number) => {
    if (pct <= 20) return "bg-red-500";
    if (pct <= 40) return "bg-orange-500";
    if (pct <= 60) return "bg-amber-500";
    if (pct <= 80) return "bg-lime-500";
    return "bg-emerald-500";
  };

  return (
    <Panel
      title={t.dashboard.hpTitle}
      addon={
        <div className="text-xl font-black text-slate-800">
          <span className={hp.current <= hp.max * 0.2 ? "text-red-500" : ""}>
            {hp.current}
          </span>
          <span className="text-slate-300 mx-1">/</span>
          <span>{hp.max}</span>
        </div>
      }
    >
      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200 mb-4">
        <div
          className={`h-full transition-all duration-500 ${getBarColor(hpPercent)}`}
          style={{ width: `${Math.min(100, Math.max(0, hpPercent))}%` }}
        ></div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => updateHP(hp.current - 1)}
          className="flex-1 py-2 flex items-center justify-center bg-slate-100 rounded-lg font-black text-slate-600 hover:bg-slate-200 transition-colors"
        >
          -
        </button>
        <button
          onClick={() => updateHP(hp.current + 1)}
          className="flex-1 py-2 flex items-center justify-center bg-slate-100 rounded-lg font-black text-slate-600 hover:bg-slate-200 transition-colors"
        >
          +
        </button>
      </div>
    </Panel>
  );
}
