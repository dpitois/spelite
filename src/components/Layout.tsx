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
    { id: "dashboard", label: currentT.layout.dashboard },
    { id: "setup", label: currentT.layout.setup },
    { id: "spells", label: currentT.layout.grimoire },
  ];

  return (
    <div className="h-screen flex flex-col bg-[#cacaca] text-slate-900 font-sans overflow-hidden">
      <header className="bg-slate-900 text-white shadow-lg z-20 shrink-0">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold tracking-tight">Spelite</h1>
            <nav className="flex gap-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={`text-sm font-medium px-3 py-1.5 rounded-md transition-colors ${
                    activeView === item.id
                      ? "bg-slate-700 text-white"
                      : "text-slate-300 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>
          </div>

          <button
            onClick={toggleLang}
            className="text-xs font-black px-2.5 py-1.5 rounded bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-all border border-slate-700 uppercase tracking-tighter"
            title={currentT.common.switchLang}
          >
            {currentLang === "fr" ? "🇬🇧 EN" : "🇫🇷 FR"}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="max-w-5xl mx-auto px-4 py-8">{children}</div>
      </main>

      <footer className="border-t border-slate-200 py-4 bg-white shrink-0 z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-2 text-slate-500 text-sm">
          <div>&copy; 2026 Spelite - {currentT.layout.footer}</div>
          <div className="text-[10px] font-mono bg-slate-50 px-2 py-1 rounded border border-slate-100 text-slate-400">
            {__COMMIT_DATE__}-{__COMMIT_HASH__}
          </div>
        </div>
      </footer>
    </div>
  );
}
