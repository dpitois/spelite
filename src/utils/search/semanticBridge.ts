import SemanticWorker from "../../workers/semantic.worker?worker";

export interface SearchResult {
  index: number;
  score: number;
  text: string;
}

interface WorkerResponse {
  id: string;
  type: "PONG" | "MODEL_READY" | "SEARCH_RESULTS" | "ERROR";
  payload: unknown;
}

class SemanticBridge {
  private worker: Worker | null = null;
  private pendingRequests = new Map<
    string,
    { resolve: (value: unknown) => void; reject: (reason?: unknown) => void }
  >();

  constructor() {
    // Lazy initialization happens on first call
  }

  private init() {
    if (this.worker) return;

    this.worker = new SemanticWorker();
    this.worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const { id, type, payload } = event.data;

      console.log(`[SemanticBridge] Received ${type} for request ${id}`);

      if (this.pendingRequests.has(id)) {
        const { resolve, reject } = this.pendingRequests.get(id)!;
        this.pendingRequests.delete(id);

        if (type === "ERROR") {
          reject(new Error(payload as string));
        } else {
          resolve(payload);
        }
      } else {
        console.warn(
          `[SemanticBridge] Received response for unknown request ID: ${id}`,
        );
      }
    };

    console.log("[SemanticBridge] Worker initialized");
  }

  private sendMessage<T>(type: string, payload?: unknown): Promise<T> {
    if (!this.worker) this.init();

    const id = crypto.randomUUID();
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
    return this.sendMessage<boolean>("INIT_MODEL");
  }

  public async search(
    query: string,
    documents: string[],
  ): Promise<SearchResult[]> {
    return this.sendMessage<SearchResult[]>("SEARCH", { query, documents });
  }
}

export const semanticBridge = new SemanticBridge();
