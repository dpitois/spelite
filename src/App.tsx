import { Suspense, lazy } from "preact/compat";
import { Layout } from "./components/Layout";
import { ReloadPrompt } from "./components/ReloadPrompt";
import { mainRoute, navigate } from "./store/router";

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
  const activeView = mainRoute.value;

  const renderView = () => {
    switch (activeView) {
      case "dashboard":
      case "home":
        return <Dashboard />;
      case "character":
        return <CharacterSetup />;
      case "spells":
        return <SpellBrowser />;
      default:
        return <Dashboard />;
    }
  };

  const handleViewChange = (view: string) => {
    if (view === "character") {
      navigate("character/edit");
    } else {
      navigate(view);
    }
  };

  return (
    <Layout activeView={activeView} onViewChange={handleViewChange}>
      <Suspense fallback={<Loading />}>{renderView()}</Suspense>
      <ReloadPrompt />
    </Layout>
  );
}

export default App;
