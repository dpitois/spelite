import { db, type Triplet } from "../data/db";

export const ONTOLOGY_CONFIG = {
  BASE_URI: "http://spelite.app/ontology/dnd#",
  RDF_SCHEMA: "http://www.w3.org/1999/02/22-rdf-syntax-ns#",
  RDFS_SCHEMA: "http://www.w3.org/2000/01/rdf-schema#",
  XSD_SCHEMA: "http://www.w3.org/2001/XMLSchema#",
};

/**
 * Maps a local predicate or subject string to a full URI.
 * Examples:
 * - "dnd:spell:fireball" -> "http://spelite.app/ontology/dnd#spell:fireball"
 * - "dnd:name" -> "http://spelite.app/ontology/dnd#name"
 */
export function mapToURI(localStr: string): string {
  if (localStr.startsWith("dnd:")) {
    return ONTOLOGY_CONFIG.BASE_URI + localStr.slice(4);
  }
  return localStr;
}

/**
 * Normalizes a value for RDF export.
 * - Booleans (stored as 1/0) are converted to true/false.
 */
export function normalizeValue(value: unknown): unknown {
  if (value === 1) return true;
  if (value === 0) return false;
  return value;
}

export class OntologyExporter {
  /**
   * Fetches all triplets from the database.
   * In a real-world scenario with massive data, this should use a cursor.
   */
  protected async getAllTriplets() {
    return await db.triplets.toArray();
  }

  /**
   * Exports the entire ontology in JSON-LD format.
   */
  async exportAsJSONLD(): Promise<string> {
    const triplets = await this.getAllTriplets();
    const subjects: Record<string, Record<string, unknown>> = {};

    for (const t of triplets) {
      if (!subjects[t.s]) {
        subjects[t.s] = { "@id": mapToURI(t.s) };
      }

      const prop = t.p.startsWith("dnd:") ? t.p.slice(4) : t.p;
      const value = normalizeValue(t.o);

      const currentSubject = subjects[t.s];

      // Handle localized literals
      if (t.lang) {
        if (!currentSubject[prop]) {
          currentSubject[prop] = [];
        }
        // Ensure it's an array for multi-lang support
        if (!Array.isArray(currentSubject[prop])) {
          currentSubject[prop] = [currentSubject[prop]];
        }
        (currentSubject[prop] as unknown[]).push({
          "@value": value,
          "@language": t.lang,
        });
      } else {
        // Multi-valued predicates (e.g., classes, components)
        if (currentSubject[prop]) {
          if (!Array.isArray(currentSubject[prop])) {
            currentSubject[prop] = [currentSubject[prop]];
          }
          (currentSubject[prop] as unknown[]).push(value);
        } else {
          currentSubject[prop] = value;
        }
      }
    }

    const jsonld = {
      "@context": {
        "@vocab": ONTOLOGY_CONFIG.BASE_URI,
        rdf: ONTOLOGY_CONFIG.RDF_SCHEMA,
        rdfs: ONTOLOGY_CONFIG.RDFS_SCHEMA,
        xsd: ONTOLOGY_CONFIG.XSD_SCHEMA,
      },
      "@graph": Object.values(subjects),
    };

    return JSON.stringify(jsonld, null, 2);
  }

  /**
   * Exports the entire ontology in RDF-XML format.
   * Uses browser native XML DOM API for robustness.
   */
  async exportAsRDFXML(): Promise<string> {
    const triplets = await this.getAllTriplets();
    const subjects: Record<string, Triplet[]> = {};

    // Group triplets by subject
    for (const t of triplets) {
      if (!subjects[t.s]) {
        subjects[t.s] = [];
      }
      subjects[t.s].push(t);
    }

    const rdfNS = ONTOLOGY_CONFIG.RDF_SCHEMA;
    const dndNS = ONTOLOGY_CONFIG.BASE_URI;
    const xsdNS = ONTOLOGY_CONFIG.XSD_SCHEMA;
    const xmlNS = "http://www.w3.org/XML/1998/namespace";

    const doc = document.implementation.createDocument(rdfNS, "rdf:RDF");
    const root = doc.documentElement;

    // Set namespaces
    root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:rdf", rdfNS);
    root.setAttributeNS(
      "http://www.w3.org/2000/xmlns/",
      "xmlns:rdfs",
      ONTOLOGY_CONFIG.RDFS_SCHEMA,
    );
    root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:dnd", dndNS);
    root.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xsd", xsdNS);

    for (const [subject, subjectTriplets] of Object.entries(subjects)) {
      const description = doc.createElementNS(rdfNS, "rdf:Description");
      description.setAttributeNS(rdfNS, "rdf:about", mapToURI(subject));

      for (const t of subjectTriplets) {
        const prop = t.p.startsWith("dnd:") ? t.p.slice(4) : t.p;
        const value = normalizeValue(t.o);
        const qname = t.p.startsWith("dnd:") ? `dnd:${prop}` : prop;

        // Use the appropriate namespace for the element
        const elementNS = t.p.startsWith("dnd:") ? dndNS : "";
        const el = doc.createElementNS(elementNS, qname);

        if (t.lang) {
          el.setAttributeNS(xmlNS, "xml:lang", t.lang);
          el.textContent = String(value);
        } else {
          if (typeof value === "string" && value.startsWith("dnd:")) {
            el.setAttributeNS(rdfNS, "rdf:resource", mapToURI(value));
          } else {
            if (typeof value === "number") {
              el.setAttributeNS(rdfNS, "rdf:datatype", `${xsdNS}integer`);
            } else if (typeof value === "boolean") {
              el.setAttributeNS(rdfNS, "rdf:datatype", `${xsdNS}boolean`);
            }
            el.textContent = String(value);
          }
        }
        description.appendChild(el);
      }

      root.appendChild(description);
    }

    const serializer = new XMLSerializer();
    const xmlString = serializer.serializeToString(doc);
    return `<?xml version="1.0" encoding="UTF-8"?>\n${xmlString}`;
  }
}
