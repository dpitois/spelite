import {
  pipeline,
  env,
  FeatureExtractionPipeline,
} from "@xenova/transformers";
import type { PipelineType } from "@xenova/transformers";

// Skip local model checks since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Define types locally for the worker context
type WorkerMessage = {
  id: string;
  type: "PING" | "INIT_MODEL" | "SEARCH";
  payload?: unknown;
};

interface SearchResult {
  index: number;
  score: number;
  text: string;
}

// Singleton class to manage the AI model
class SemanticPipeline {
  static task: PipelineType = "feature-extraction";
  static model = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance() {
    if (this.instance === null) {
      console.log(`[SemanticWorker] Loading model ${this.model}...`);
      this.instance = pipeline(this.task, this.model, {
        quantized: true, // Use quantized model for smaller size/faster loading
      }) as Promise<FeatureExtractionPipeline>;
    }
    return this.instance;
  }
}

// Cosine similarity calculator
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;
  return dotProduct / (magnitudeA * magnitudeB);
}

self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case "PING":
        self.postMessage({ id, type: "PONG", payload: "Worker is alive" });
        break;

      case "INIT_MODEL":
        await SemanticPipeline.getInstance();
        self.postMessage({ id, type: "MODEL_READY", payload: true });
        break;

      case "SEARCH": {
        const { query, documents } = payload as {
          query: string;
          documents: string[];
        };

        if (!query || !documents || documents.length === 0) {
          self.postMessage({ id, type: "SEARCH_RESULTS", payload: [] });
          return;
        }

        const extractor = await SemanticPipeline.getInstance();

        // 1. Embed the query
        // pooling: 'mean' and normalize: true are standard for sentence similarity
        const queryOutput = await extractor(query, {
          pooling: "mean",
          normalize: true,
        });
        const queryEmbedding = Array.from(queryOutput.data);

        // 2. Embed the documents (batch processing if possible, but sequential for safety in loop)
        // Note: For large datasets, we should pre-compute these or batch them.
        const results: SearchResult[] = [];

        // Simple iteration for this step (can be optimized later with batching)
        for (let i = 0; i < documents.length; i++) {
          const docOutput = await extractor(documents[i], {
            pooling: "mean",
            normalize: true,
          });
          const docEmbedding = Array.from(docOutput.data);
          const score = cosineSimilarity(
            queryEmbedding as number[],
            docEmbedding as number[],
          );

          results.push({
            index: i,
            score: score,
            text: documents[i],
          });
        }

        // 3. Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        self.postMessage({ id, type: "SEARCH_RESULTS", payload: results });
        break;
      }

      default:
        console.warn("[SemanticWorker] Unknown message type:", type);
    }
  } catch (error) {
    console.error("[SemanticWorker] Error processing message:", error);
    self.postMessage({
      id,
      type: "ERROR",
      payload: error instanceof Error ? error.message : String(error),
    });
  }
});
