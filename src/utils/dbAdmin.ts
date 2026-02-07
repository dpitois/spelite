import { db } from "../data/db";

export interface DBStats {
  tripletsCount: number;
  embeddingsCount: number;
  dbVersion: number;
  dataVersion: string;
  storageUsage?: number; // Approximate in bytes if available
}

export const dbAdmin = {
  /**
   * Retrieves current statistics about the IndexedDB
   */
  async getStats(): Promise<DBStats> {
    try {
      const tripletsCount = await db.triplets.count();
      const embeddingsCount = await db.embeddings.count();
      const dataVersion =
        localStorage.getItem("spelite_ontology_version") || "unknown";

      let storageUsage = 0;
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          storageUsage = estimate.usage;
        }
      }

      return {
        tripletsCount,
        embeddingsCount,
        dbVersion: db.verno,
        dataVersion,
        storageUsage,
      };
    } catch (error) {
      console.error("[dbAdmin] Failed to get stats:", error);
      return {
        tripletsCount: -1,
        embeddingsCount: -1,
        dbVersion: 0,
        dataVersion: "error",
      };
    }
  },

  /**
   * Clears only the semantic embeddings table.
   * Useful to force a re-indexing without losing application data.
   */
  async clearEmbeddings(): Promise<void> {
    console.log("[dbAdmin] Clearing embeddings table...");
    await db.embeddings.clear();
  },

  /**
   * Clears the entire database including character data/triplets.
   * DANGEROUS: Should be protected by UI confirmation.
   */
  async deleteDatabase(): Promise<void> {
    console.warn("[dbAdmin] DELETING DATABASE...");
    await db.delete();
    // We need to reload the page to re-open the DB cleanly
    window.location.reload();
  },
};
