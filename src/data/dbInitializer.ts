import { db } from "./db";
import { flattenGraphToTriplets } from "../utils/ontologyFlattener";

const STORAGE_KEY_VERSION = "spelite_ontology_version";
// Current version based on the data or a simple timestamp
const CURRENT_VERSION = "20260207-v5";

export async function initializeDatabase() {
  const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION);

  if (storedVersion === CURRENT_VERSION) {
    const tripletCount = await db.triplets.count();
    const embeddingCount = await db.embeddings.count();
    if (tripletCount > 0 && embeddingCount > 0) {
      console.log(
        "Database already initialized with version:",
        CURRENT_VERSION,
      );
      return;
    }
  }

  console.log("Initializing/Updating triplet store and embeddings...");

  try {
    // Dynamically import data only when needed
    const [spellsData, classesData, racesData, embeddingsData] =
      await Promise.all([
        import("./spells.json"),
        import("./classes.json"),
        import("./races.json"),
        import("./embeddings.json"),
      ]);

    // Clear existing data to avoid duplicates on update
    await db.triplets.clear();
    await db.embeddings.clear();

    const castSpells = spellsData.default as unknown as { "@graph": unknown[] };
    const castClasses = classesData.default as unknown as {
      "@graph": unknown[];
    };
    const castRaces = racesData.default as unknown as { "@graph": unknown[] };

    const spellTriplets = flattenGraphToTriplets(castSpells["@graph"]);
    const classTriplets = flattenGraphToTriplets(castClasses["@graph"]);
    const raceTriplets = flattenGraphToTriplets(castRaces["@graph"]);

    const allTriplets = [...spellTriplets, ...classTriplets, ...raceTriplets];

    // Use bulkAdd for performance
    await db.triplets.bulkAdd(allTriplets);

    // Use bulkPut for embeddings
    const allEmbeddings = embeddingsData.default as unknown as {
      text: string;
      vector: number[];
    }[];
    await db.embeddings.bulkPut(allEmbeddings);

    localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
    console.log(
      `Successfully ingested ${allTriplets.length} triplets and ${allEmbeddings.length} embeddings.`,
    );
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
