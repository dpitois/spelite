import type { ComponentChildren } from "preact";
import { language, t, actions } from "../store/signals";

interface LayoutProps {
  children: ComponentChildren;
  activeView: string;
  onViewChange: (view: string) => void;
}

export function Layout({ children, activeView, onViewChange }: LayoutProps) {
  const currentLang = language.value;
  const currentT = t.value;

  const toggleLang = () => {
    actions.setLanguage(currentLang === "fr" ? "en" : "fr");
  };

  const navItems = [
    {
      id: "dashboard",
      label: currentT.layout.dashboard,
      short: currentT.layout.dashboardShort,
    },
    {
      id: "setup",
      label: currentT.layout.setup,
      short: currentT.layout.setupShort,
    },
    {
      id: "spells",
      label: currentT.layout.grimoire,
      short: currentT.layout.grimoireShort,
    },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#cacaca] text-slate-900 font-sans overflow-hidden">
      <header className="bg-slate-900 text-white shadow-lg z-20 shrink-0">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-6">
            <h1 className="text-xl font-bold tracking-tight">Spelite</h1>
            <nav className="flex gap-1 sm:gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`text-sm font-medium px-2 sm:px-3 py-1.5 rounded-md transition-colors ${
                    activeView === item.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <span className="hidden sm:inline">{item.label}</span>
                  <span className="sm:hidden">{item.short}</span>
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={toggleLang}
            className="text-xs font-black px-2 sm:px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 uppercase tracking-tighter"
            title={currentT.common.switchLang}
          >
            <span className="hidden sm:inline">
              {currentLang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
            </span>
            <span className="sm:hidden">
              {currentLang === "fr" ? "EN" : "FR"}
            </span>
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>

      <footer className="border-t border-slate-200 py-3 sm:py-4 bg-white shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-2 sm:px-4 flex flex-row justify-between items-center gap-1 text-slate-500 text-[10px] sm:text-sm">
          <div>
            &copy; 2026 Spelite{" "}
            <span className="hidden sm:inline">- {currentT.layout.footer}</span>
          </div>
          <div className="text-[9px] sm:text-[10px] font-mono bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 text-slate-400">
            {__COMMIT_DATE__}-{__COMMIT_HASH__}
          </div>
        </div>
      </footer>
    </div>
  );
}
