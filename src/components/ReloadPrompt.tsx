import { useRegisterSW } from "virtual:pwa-register/preact";
import { t } from "../store/signals";

export function ReloadPrompt() {
  const currentT = t.value;
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegistered(r: ServiceWorkerRegistration | undefined) {
      console.log("SW Registered: " + r);
    },
    onRegisterError(error: unknown) {
      console.log("SW registration error", error);
    },
  });

  const close = () => {
    setOfflineReady(false);
    setNeedRefresh(false);
  };

  if (!offlineReady && !needRefresh) {
    return null;
  }

  return (
    <div className="fixed right-0 bottom-0 m-4 p-4 z-50">
      <div className="bg-slate-800 border border-slate-700 shadow-2xl rounded-xl p-4 flex flex-col gap-3 min-w-[300px] animate-in fade-in slide-in-from-bottom-4 duration-300">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            {offlineReady ? (
              <p className="text-slate-200 text-sm font-medium">
                {currentT.pwa.offlineReady}
              </p>
            ) : (
              <p className="text-slate-200 text-sm font-medium">
                {currentT.pwa.updateAvailable}
              </p>
            )}
          </div>
          <button
            onClick={close}
            className="text-slate-400 hover:text-white transition-colors"
            aria-label={currentT.common.close}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>

        {needRefresh && (
          <button
            onClick={() => updateServiceWorker(true)}
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold py-2 px-4 rounded-lg transition-colors shadow-lg shadow-indigo-500/20"
          >
            {currentT.pwa.updateBtn}
          </button>
        )}
      </div>
    </div>
  );
}
