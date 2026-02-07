import SemanticWorker from "../../workers/semantic.worker?worker";

export interface SearchResult {
  index: number;
  score: number;
  text: string;
}

interface WorkerResponse {
  id: string;
  type: "PONG" | "MODEL_READY" | "SEARCH_RESULTS" | "ERROR" | "PROGRESS";
  payload: unknown;
}

export type ProgressCallback = (progress: {
  status: string;
  name: string;
  file: string;
  progress: number;
  loaded: number;
  total: number;
}) => void;

class SemanticBridge {
  private worker: Worker | null = null;
  private isInitialized = false;
  private onProgress: ProgressCallback | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
  >();

  constructor() {
    // Lazy initialization happens on first call
  }

  public get initialized() {
    return this.isInitialized;
  }

  public setProgressCallback(callback: ProgressCallback) {
    this.onProgress = callback;
  }

  private init() {
    if (this.worker) return;

    this.worker = new SemanticWorker();
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, type, payload } = event.data;

      if (type === "PROGRESS") {
        if (this.onProgress)
          this.onProgress(payload as Parameters<ProgressCallback>[0]);
        return;
      }

      console.log(`[SemanticBridge] Received ${type} for request ${id}`);

      if (this.pendingRequests.has(id)) {
        const { resolve, reject } = this.pendingRequests.get(id)!;

        if (
          type === "MODEL_READY" ||
          type === "SEARCH_RESULTS" ||
          type === "PONG"
        ) {
          this.pendingRequests.delete(id);
          resolve(payload);
        } else if (type === "ERROR") {
          this.pendingRequests.delete(id);
          reject(new Error(payload as string));
        }
      } else {
        console.warn(
          `[SemanticBridge] Received response for unknown request ID: ${id}`,
        );
      }
    };

    this.worker.onerror = (error) => {
      console.error("[SemanticBridge] Worker error:", error);
    };

    console.log("[SemanticBridge] Worker initialized");
  }

  private sendMessage<T>(type: string, payload?: unknown): Promise<T> {
    if (!this.worker) this.init();

    const id =
      typeof crypto !== "undefined" && crypto.randomUUID
        ? crypto.randomUUID()
        : Math.random().toString(36).substring(2, 11);

    return new Promise((resolve, reject) => {
      this.pendingRequests.set(id, {
        resolve: resolve as (value: unknown) => void,
        reject,
      });
      this.worker!.postMessage({ id, type, payload });
    });
  }

  public async ping(): Promise<string> {
    return this.sendMessage<string>("PING");
  }

  public async initModel(): Promise<boolean> {
    const result = await this.sendMessage<boolean>("INIT_MODEL");
    this.isInitialized = true;
    return result;
  }

  public async search(
    query: string,
    documents: string[],
  ): Promise<SearchResult[]> {
    return this.sendMessage<SearchResult[]>("SEARCH", { query, documents });
  }
}

export const semanticBridge = new SemanticBridge();
