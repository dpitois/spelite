import { describe, it, expect, vi, beforeEach } from "vitest";
import { searchSpells } from "../searchEngine";
import { ontologyRepository } from "../../../data/ontologyRepository";
import { semanticBridge } from "../semanticBridge";
import type { Spell } from "../../../types/dnd";

vi.mock("../../../data/ontologyRepository", () => ({
  ontologyRepository: {
    search: vi.fn(),
    getAll: vi.fn(),
    getById: vi.fn(),
  },
}));

vi.mock("../semanticBridge", () => ({
  semanticBridge: {
    search: vi.fn(),
    initialized: true,
    initModel: vi.fn(),
    setProgressCallback: vi.fn(),
  },
}));

describe("searchEngine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should NOT call semanticBridge when aiSearchEnabled is false", async () => {
    const mockSpells = [
      {
        index: "fireball",
        name: "Fireball",
        level: 3,
        desc: ["A ball of fire"],
        classes: [{ index: "wizard", name: "Wizard" }],
      },
    ];
    vi.mocked(ontologyRepository.search).mockResolvedValue(
      mockSpells as unknown as Spell[],
    );

    await searchSpells({
      searchTerm: "fireball",
      aiSearchEnabled: false,
      isModelReady: true,
      indexingProgress: 100,
      currentLang: "en",
      filters: {
        level: "all",
        class: "all",
        school: "all",
        damage: "all",
        save: "all",
        action: "all",
      },
    });

    expect(semanticBridge.search).not.toHaveBeenCalled();
    expect(ontologyRepository.search).toHaveBeenCalled();
  });

  it("should call semanticBridge when aiSearchEnabled is true and conditions are met", async () => {
    const mockSpells = [
      {
        index: "shield",
        name: "Shield",
        desc: ["Description"],
        level: 1,
        classes: [{ index: "wizard", name: "Wizard" }],
      },
    ];
    vi.mocked(ontologyRepository.search).mockResolvedValue(
      mockSpells as unknown as Spell[],
    );
    vi.mocked(semanticBridge.search).mockResolvedValue([
      { index: 0, score: 0.9, text: "shield" },
    ]);

    await searchSpells({
      searchTerm: "shield",
      aiSearchEnabled: true,
      isModelReady: true,
      indexingProgress: 100,
      currentLang: "en",
      filters: {
        level: "all",
        class: "all",
        school: "all",
        damage: "all",
        save: "all",
        action: "all",
      },
    });

    expect(semanticBridge.search).toHaveBeenCalled();
  });

  it("should include lexical matches even if semantic score is below threshold (Hybridization)", async () => {
    const mockSpells = [
      {
        index: "shield-of-faith",
        name: "Bouclier de la foi",
        desc: ["Protection magic"],
        level: 1,
        classes: [{ index: "cleric", name: "Cleric" }],
      },
      {
        index: "other-spell",
        name: "Autre sort",
        desc: ["High relevance description about protection"],
        level: 1,
        classes: [{ index: "cleric", name: "Cleric" }],
      },
    ];

    vi.mocked(ontologyRepository.search).mockResolvedValue(
      mockSpells as unknown as Spell[],
    );

    // Mock semantic results:
    // "Other spell" gets a high score (0.9)
    // "Bouclier de la foi" gets a low score (0.1), which is below threshold (max(0.25, 0.9 * 0.6) = 0.54)
    vi.mocked(semanticBridge.search).mockResolvedValue([
      { index: 1, score: 0.9, text: "autre sort" },
      { index: 0, score: 0.1, text: "bouclier de la foi" },
    ]);

    const results = await searchSpells({
      searchTerm: "bouclier",
      aiSearchEnabled: true,
      isModelReady: true,
      indexingProgress: 100,
      currentLang: "fr",
      filters: {
        level: "all",
        class: "all",
        school: "all",
        damage: "all",
        save: "all",
        action: "all",
      },
    });

    // Both should be present thanks to hybridization
    expect(results.map((s) => s.index)).toContain("shield-of-faith");
    expect(results.map((s) => s.index)).toContain("other-spell");

    // With 70/30 weighting:
    // "Shield of faith" has Lexical 1.0 (contains "bouclier") -> Score = 0.7 * 1.0 + 0.3 * 0.1 = 0.73
    // "Other spell" has Lexical 0.0 + Semantic 0.9 -> Score = 0.7 * 0.0 + 0.3 * 0.9 = 0.27
    // So "Shield of faith" should now be FIRST
    expect(results[0].index).toBe("shield-of-faith");
  });

  it("should prioritize exact name matches even if semantic similarity is lower", async () => {
    const mockSpells = [
      {
        index: "guidance",
        name: "Assistance",
        desc: ["Gives a d4 bonus to a check"],
        level: 0,
        classes: [{ index: "cleric", name: "Cleric" }],
      },
      {
        index: "shield-of-faith",
        name: "Bouclier de la foi",
        desc: ["Protection magic"],
        level: 1,
        classes: [{ index: "cleric", name: "Cleric" }],
      },
    ];

    vi.mocked(ontologyRepository.search).mockResolvedValue(
      mockSpells as unknown as Spell[],
    );

    // Mock semantic results:
    // "Assistance" gets a high semantic score (0.9) but 0 lexical score for "bouclier"
    // "Bouclier de la foi" gets a medium semantic score (0.6) but high lexical score (1.0)
    vi.mocked(semanticBridge.search).mockResolvedValue([
      { index: 0, score: 0.9, text: "assistance" },
      { index: 1, score: 0.6, text: "bouclier de la foi" },
    ]);

    const results = await searchSpells({
      searchTerm: "bouclier",
      aiSearchEnabled: true,
      isModelReady: true,
      indexingProgress: 100,
      currentLang: "fr",
      filters: {
        level: "all",
        class: "all",
        school: "all",
        damage: "all",
        save: "all",
        action: "all",
      },
    });

    // "Bouclier de la foi" should be first because of the 70% Lexical weight
    expect(results[0].index).toBe("shield-of-faith");
    expect(results[1].index).toBe("guidance");
  });
});
