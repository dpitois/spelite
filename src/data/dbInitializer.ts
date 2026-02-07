import { db } from "./db";
import { flattenGraphToTriplets } from "../utils/ontologyFlattener";

const STORAGE_KEY_VERSION = "spelite_ontology_version";
// Current version based on the data or a simple timestamp
const CURRENT_VERSION = "20260207-v4";

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

  console.log("Initializing/Updating triplet store (loading data chunks)...");

  try {
    // Dynamically import data only when needed
    const [spellsData, classesData, racesData] = await Promise.all([
      import("./spells.json"),
      import("./classes.json"),
      import("./races.json"),
    ]);

    // Clear existing triplets to avoid duplicates on update
    await db.triplets.clear();

    const spellTriplets = flattenGraphToTriplets(spellsData.default["@graph"]);
    const classTriplets = flattenGraphToTriplets(classesData.default["@graph"]);
    const raceTriplets = flattenGraphToTriplets(racesData.default["@graph"]);

    const allTriplets = [...spellTriplets, ...classTriplets, ...raceTriplets];

    // Use bulkAdd for performance
    await db.triplets.bulkAdd(allTriplets);

    localStorage.setItem(STORAGE_KEY_VERSION, CURRENT_VERSION);
    console.log(`Successfully ingested ${allTriplets.length} triplets.`);
  } catch (error) {
    console.error("Failed to initialize database:", error);
  }
}
