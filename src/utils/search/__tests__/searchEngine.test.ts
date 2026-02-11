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
});
