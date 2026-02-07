import Dexie, { type Table } from "dexie";

export interface Triplet {
  id?: number;
  s: string; // Subject (e.g., spell:fireball)
  p: string; // Predicate (e.g., dnd:level)
  o: string | number | boolean; // Object (e.g., 3)
  lang?: string; // Optional: language for literal values (e.g., 'fr', 'en')
}

export class SpeliteDatabase extends Dexie {
  triplets!: Table<Triplet>;
  embeddings!: Table<{ text: string; vector: number[] }>;

  constructor() {
    super("SpeliteDatabase");
    this.version(1).stores({
      // ++ is auto-increment primary key
      // s is subject index for finding all predicates of a subject
      // [p+o] is compound index for finding subjects matching a predicate-object pair
      // lang is index for filtering by language
      triplets: "++id, s, [p+o], lang",
    });

    this.version(2).stores({
      triplets: "++id, s, [p+o], lang",
      embeddings: "&text", // Unique index on text
    });
  }
}

export const db = new SpeliteDatabase();
