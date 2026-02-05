import { useState } from "preact/hooks";
import { Suspense, lazy } from "preact/compat";
import { Layout } from "./components/Layout";
import { ReloadPrompt } from "./components/ReloadPrompt";

// Lazy load views to split bundle
const Dashboard = lazy(() =>
  import("./views/Dashboard").then((module) => ({ default: module.Dashboard })),
);
const CharacterSetup = lazy(() =>
  import("./views/CharacterSetup").then((module) => ({
    default: module.CharacterSetup,
  })),
);
const SpellBrowser = lazy(() =>
  import("./views/SpellBrowser").then((module) => ({
    default: module.SpellBrowser,
  })),
);

function Loading() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-slate-500 gap-4">
      <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      <p>Chargement...</p>
    </div>
  );
}

function App() {
  const [activeView, setActiveView] = useState("dashboard");

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
        return <Dashboard />;
      case "setup":
        return <CharacterSetup />;
      case "spells":
        return <SpellBrowser />;
      default:
        return null;
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={setActiveView}>
      <Suspense fallback={<Loading />}>{renderView()}</Suspense>
      <ReloadPrompt />
    </Layout>
  );
}

export default App;
