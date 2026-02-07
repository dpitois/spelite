import SemanticWorker from "../../workers/semantic.worker?worker";

class SemanticBridge {
  private worker: Worker | null = null;

  constructor() {
    this.init();
  }

  private init() {
    if (this.worker) return;

    this.worker = new SemanticWorker();
    this.worker.onmessage = (event) => {
      console.log("[SemanticBridge] Message from worker:", event.data);
    };

    console.log("[SemanticBridge] Worker initialized");
  }

  public ping() {
    if (!this.worker) this.init();
    this.worker?.postMessage({ type: "PING", payload: Date.now() });
  }
}

export const semanticBridge = new SemanticBridge();
