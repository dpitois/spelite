import { describe, it, expect } from "vitest";
import { getDurationValue, getRangeValue } from "../spellSorting";

describe("spellSorting", () => {
  describe("getDurationValue", () => {
    it("should handle basic units", () => {
      expect(getDurationValue("Instantaneous")).toBe(0);
      expect(getDurationValue("1 round")).toBe(1);
      expect(getDurationValue("1 minute")).toBe(10);
      expect(getDurationValue("1 hour")).toBe(600);
      expect(getDurationValue("8 hours")).toBe(4800);
    });

    it("should handle French units", () => {
      expect(getDurationValue("Instantanée")).toBe(0);
      expect(getDurationValue("1 minute")).toBe(10);
      expect(getDurationValue("1 heure")).toBe(600);
    });

    it("should handle special durations", () => {
      expect(getDurationValue("Until dispelled")).toBe(999999);
      expect(getDurationValue("Special")).toBe(888888);
    });
  });

  describe("getRangeValue", () => {
    it("should handle basic distances (EN)", () => {
      expect(getRangeValue("Self")).toBe(0);
      expect(getRangeValue("Touch")).toBe(1);
      expect(getRangeValue("30 feet")).toBe(30);
      expect(getRangeValue("60 feet")).toBe(60);
      expect(getRangeValue("1 mile")).toBe(5280);
    });

    it("should handle basic distances (FR)", () => {
      expect(getRangeValue("Personnelle")).toBe(0);
      expect(getRangeValue("Contact")).toBe(1);
      expect(getRangeValue("9 mètres")).toBe(Math.round(9 * 3.28));
      expect(getRangeValue("18 mètres")).toBe(Math.round(18 * 3.28));
    });

    it("should handle special ranges", () => {
      expect(getRangeValue("Sight")).toBe(999998);
      expect(getRangeValue("Unlimited")).toBe(999999);
    });
  });
});
