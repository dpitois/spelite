import { pipeline, env, FeatureExtractionPipeline } from "@xenova/transformers";
import type { PipelineType } from "@xenova/transformers";
import Dexie, { type Table } from "dexie";

// Skip local model checks since we are running in the browser
env.allowLocalModels = false;
env.useBrowserCache = true;

// Configure WASM paths to use local files from public/ directory
env.backends.onnx.wasm.wasmPaths = "/";

console.log("[SemanticWorker] Worker script started");

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

// Minimal DB definition for Worker
class WorkerDatabase extends Dexie {
  embeddings!: Table<{ text: string; vector: number[] }>;

  constructor() {
    super("SpeliteDatabase");
    // We must match the schema version definition from the main app
    this.version(1).stores({
      triplets: "++id, s, [p+o], lang",
    });
    this.version(2).stores({
      triplets: "++id, s, [p+o], lang",
      embeddings: "&text",
    });
  }
}

const db = new WorkerDatabase();

// Singleton class to manage the AI model
class SemanticPipeline {
  static task: PipelineType = "feature-extraction";
  static model = "Xenova/paraphrase-multilingual-MiniLM-L12-v2";
  static instance: Promise<FeatureExtractionPipeline> | null = null;

  static async getInstance(progress_callback?: (progress: unknown) => void) {
    if (this.instance === null) {
      console.log(`[SemanticWorker] Loading model ${this.model}...`);
      this.instance = pipeline(this.task, this.model, {
        quantized: true, // Use quantized model for smaller size/faster loading
        progress_callback,
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

// Cache for document embeddings: text -> embedding vector
const embeddingsCache = new Map<string, number[]>();

self.addEventListener("message", async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, payload } = event.data;

  try {
    switch (type) {
      case "PING":
        self.postMessage({ id, type: "PONG", payload: "Worker is alive" });
        break;

      case "INIT_MODEL":
        await SemanticPipeline.getInstance((progress) => {
          self.postMessage({ id, type: "PROGRESS", payload: progress });
        });
        self.postMessage({ id, type: "MODEL_READY", payload: true });
        break;

      case "SEARCH": {
        const { query, documents } = payload as {
          query: string;
          documents: string[];
        };

        console.log(
          `[SemanticWorker] Starting search for "${query}" across ${documents.length} documents.`,
        );

        if (!query || !documents || documents.length === 0) {
          self.postMessage({ id, type: "SEARCH_RESULTS", payload: [] });
          return;
        }

        const extractor = await SemanticPipeline.getInstance();

        // 1. Embed the query
        const queryOutput = await extractor(query, {
          pooling: "mean",
          normalize: true,
        });
        const queryEmbedding = Array.from(queryOutput.data);

        // 2. Identify missing embeddings in Memory Cache
        const docsMissingInMemory: { text: string; index: number }[] = [];
        const results: SearchResult[] = [];

        documents.forEach((doc, index) => {
          if (embeddingsCache.has(doc)) {
            // Already in memory
            const docEmbedding = embeddingsCache.get(doc)!;
            const score = cosineSimilarity(
              queryEmbedding as number[],
              docEmbedding,
            );
            results.push({ index, score, text: doc });
          } else {
            docsMissingInMemory.push({ text: doc, index });
          }
        });

        // 3. Check IndexedDB for those missing in memory
        const docsToCompute: { text: string; index: number }[] = [];

        if (docsMissingInMemory.length > 0) {
          console.log(
            `[SemanticWorker] Checking DB for ${docsMissingInMemory.length} docs...`,
          );
          const textsToLookup = docsMissingInMemory.map((d) => d.text);
          const dbRecords = await db.embeddings.bulkGet(textsToLookup);

          docsMissingInMemory.forEach((docItem, i) => {
            const record = dbRecords[i];
            if (record) {
              // Found in DB -> Add to Memory Cache & Results
              embeddingsCache.set(docItem.text, record.vector);
              const score = cosineSimilarity(
                queryEmbedding as number[],
                record.vector,
              );
              results.push({ index: docItem.index, score, text: docItem.text });
            } else {
              // Not in DB -> Needs computation
              docsToCompute.push(docItem);
            }
          });

          // Report progress after DB lookup
          self.postMessage({
            id,
            type: "PROGRESS",
            payload: {
              status: "indexing",
              progress: Math.round(
                ((documents.length - docsToCompute.length) / documents.length) *
                  100,
              ),
            },
          });
        }

        // 4. Compute embeddings for totally new docs
        if (docsToCompute.length > 0) {
          console.log(
            `[SemanticWorker] Computing embeddings for ${docsToCompute.length} new documents...`,
          );

          const BATCH_SIZE = 10;
          const rawDocs = docsToCompute.map((d) => d.text);
          const newRecordsToSave: { text: string; vector: number[] }[] = [];

          for (let i = 0; i < rawDocs.length; i += BATCH_SIZE) {
            const batchTexts = rawDocs.slice(i, i + BATCH_SIZE);
            const currentBatch = Math.floor(i / BATCH_SIZE) + 1;
            const totalBatches = Math.ceil(rawDocs.length / BATCH_SIZE);

            console.log(
              `[SemanticWorker] Processing batch ${currentBatch}/${totalBatches}`,
            );

            // Send indexing progress
            const processedCount = documents.length - docsToCompute.length + i;
            self.postMessage({
              id,
              type: "PROGRESS",
              payload: {
                status: "indexing",
                progress: Math.round((processedCount / documents.length) * 100),
              },
            });

            const batchOutput = await extractor(batchTexts, {
              pooling: "mean",
              normalize: true,
            });

            const embeddingSize = batchOutput.dims[1];
            const flatData = batchOutput.data;

            for (let j = 0; j < batchTexts.length; j++) {
              const start = j * embeddingSize;
              const end = start + embeddingSize;
              const docEmbedding = Array.from(flatData.slice(start, end));

              const originalIndex = docsToCompute[i + j].index;
              const originalText = docsToCompute[i + j].text;

              // Update Memory Cache
              embeddingsCache.set(originalText, docEmbedding as number[]);

              // Queue for DB Save
              newRecordsToSave.push({
                text: originalText,
                vector: docEmbedding as number[],
              });

              const score = cosineSimilarity(
                queryEmbedding as number[],
                docEmbedding as number[],
              );

              results.push({
                index: originalIndex,
                score: score,
                text: originalText,
              });
            }
          }

          // Bulk save to DB
          if (newRecordsToSave.length > 0) {
            console.log(
              `[SemanticWorker] Persisting ${newRecordsToSave.length} embeddings to IndexedDB...`,
            );
            // Fire and forget - don't block search results on DB write
            db.embeddings.bulkPut(newRecordsToSave).catch((err) => {
              console.error(
                "[SemanticWorker] Failed to save embeddings to DB:",
                err,
              );
            });
          }
        }

        // 5. Sort by score (descending)
        results.sort((a, b) => b.score - a.score);

        console.log(
          `[SemanticWorker] Search completed. Top result score: ${results[0]?.score}`,
        );

        // Final progress report
        self.postMessage({
          id,
          type: "PROGRESS",
          payload: { status: "indexing", progress: 100 },
        });

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
