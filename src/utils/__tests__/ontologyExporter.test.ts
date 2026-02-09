import { describe, it, expect } from "vitest";
import {
  mapToURI,
  normalizeValue,
  ONTOLOGY_CONFIG,
  OntologyExporter,
} from "../ontologyExporter";
import { Triplet } from "../../data/db";

describe("OntologyExporter Utils", () => {
  describe("mapToURI", () => {
    it("should map dnd: prefixes to the base URI", () => {
      expect(mapToURI("dnd:name")).toBe(ONTOLOGY_CONFIG.BASE_URI + "name");
      expect(mapToURI("dnd:spell:fireball")).toBe(
        ONTOLOGY_CONFIG.BASE_URI + "spell:fireball",
      );
    });

    it("should leave non-dnd strings unchanged", () => {
      expect(mapToURI("http://example.org/test")).toBe(
        "http://example.org/test",
      );
      expect(mapToURI("label")).toBe("label");
    });
  });

  describe("normalizeValue", () => {
    it("should convert 1 to true and 0 to false", () => {
      expect(normalizeValue(1)).toBe(true);
      expect(normalizeValue(0)).toBe(false);
    });

    it("should leave other values unchanged", () => {
      expect(normalizeValue("test")).toBe("test");
      expect(normalizeValue(42)).toBe(42);
      expect(normalizeValue(null)).toBe(null);
    });
  });

  describe("OntologyExporter JSON-LD", () => {
    it("should export triplets as a valid JSON-LD graph", async () => {
      const exporter = new (class extends OntologyExporter {
        protected override async getAllTriplets() {
          return [
            {
              s: "dnd:spell:fireball",
              p: "dnd:name",
              o: "Fireball",
              lang: "en",
            },
            {
              s: "dnd:spell:fireball",
              p: "dnd:name",
              o: "Boule de feu",
              lang: "fr",
            },
            { s: "dnd:spell:fireball", p: "dnd:level", o: 3 },
            { s: "dnd:spell:fireball", p: "dnd:classes", o: "wizard" },
            { s: "dnd:spell:fireball", p: "dnd:classes", o: "sorcerer" },
          ] as Triplet[];
        }
      })();

      const result = JSON.parse(await exporter.exportAsJSONLD());

      expect(result["@context"]["@vocab"]).toBe(ONTOLOGY_CONFIG.BASE_URI);
      const graph = result["@graph"] as Record<string, unknown>[];
      const fireball = graph.find(
        (i) => i["@id"] === ONTOLOGY_CONFIG.BASE_URI + "spell:fireball",
      );

      expect(fireball).toBeDefined();
      expect(fireball!.level).toBe(3);
      expect(fireball!.classes as string[]).toContain("wizard");
      expect(fireball!.classes as string[]).toContain("sorcerer");

      const names = fireball!.name;
      expect(names).toEqual(
        expect.arrayContaining([
          { "@value": "Fireball", "@language": "en" },
          { "@value": "Boule de feu", "@language": "fr" },
        ]),
      );
    });
  });

  describe("OntologyExporter RDF-XML", () => {
    it("should export triplets as valid RDF-XML", async () => {
      const exporter = new (class extends OntologyExporter {
        protected override async getAllTriplets() {
          return [
            {
              s: "dnd:spell:fireball",
              p: "dnd:name",
              o: "Fireball",
              lang: "en",
            },
            { s: "dnd:spell:fireball", p: "dnd:level", o: 3 },
            {
              s: "dnd:spell:fireball",
              p: "dnd:classes",
              o: "dnd:class:wizard",
            },
          ] as Triplet[];
        }
      })();

      const xml = await exporter.exportAsRDFXML();

      expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(xml).toContain("rdf:RDF");
      expect(xml).toContain(ONTOLOGY_CONFIG.BASE_URI + "spell:fireball");
      expect(xml).toContain("Fireball");
      expect(xml).toContain(ONTOLOGY_CONFIG.XSD_SCHEMA + "integer");
      expect(xml).toContain(ONTOLOGY_CONFIG.BASE_URI + "class:wizard");
    });
  });
});
