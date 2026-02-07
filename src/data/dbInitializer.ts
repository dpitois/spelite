import { db } from "./db";
import { flattenGraphToTriplets } from "../utils/ontologyFlattener";
import spellsData from "./spells.json";

const STORAGE_KEY_VERSION = "spelite_ontology_version";
// Current version based on the data or a simple timestamp
const CURRENT_VERSION = "20260207-v2";

export async function initializeDatabase() {
  const storedVersion = localStorage.getItem(STORAGE_KEY_VERSION);

  if (storedVersion === CURRENT_VERSION) {
    const count = await db.triplets.count();
    if (count > 0) {
      console.log(
        "Database already initialized with version:",
        CURRENT_VERSION,
      );
      return;
    }
  }

  console.log("Initializing/Updating triplet store...");

  try {
    // Clear existing triplets to avoid duplicates on update
    await db.triplets.clear();

    const triplets = flattenGraphToTriplets(spellsData["@graph"]);

    // Use bulkAdd for performance
    await db.triplets.bulkAdd(triplets);

    localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
    console.log(`Successfully ingested ${triplets.length} triplets.`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
