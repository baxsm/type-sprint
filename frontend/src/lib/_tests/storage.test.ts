import { beforeEach, describe, expect, it } from "vitest";
import {
  addRun,
  clearRuns,
  loadDaily,
  loadProfile,
  loadRuns,
  saveDaily,
  saveProfile,
} from "../storage";
import type { DailyResult, Run } from "../types";

function makeRun(overrides: Partial<Run> = {}): Run {
  return {
    id: Math.random().toString(36).slice(2),
    finishedAt: Date.now(),
    mode: "practice",
    language: "javascript",
    difficulty: "easy",
    snippetId: "js-easy-001",
    wpm: 60,
    rawWpm: 62,
    accuracy: 97,
    consistency: 90,
    durationMs: 5000,
    charCount: 50,
    errorCount: 1,
    ...overrides,
  };
}

beforeEach(() => {
  localStorage.clear();
});

describe("profile storage", () => {
  it("returns defaults when empty", () => {
    const p = loadProfile();
    expect(p.name).toBe("Guest");
    expect(p.lastLanguage).toBe("javascript");
    expect(p.character).toEqual({ style: "adventurer", seed: "guest" });
  });

  it("round-trips a saved patch", () => {
    saveProfile({ name: "Alex", lastLanguage: "python" });
    const p = loadProfile();
    expect(p.name).toBe("Alex");
    expect(p.lastLanguage).toBe("python");
  });

  it("returns defaults on corrupted json", () => {
    localStorage.setItem("type-sprint:profile", "{not valid");
    expect(loadProfile().name).toBe("Guest");
  });

  it("defaults the character field for a pre-phase-8 profile missing it entirely", () => {
    localStorage.setItem(
      "type-sprint:profile",
      JSON.stringify({ name: "Old User", lastLanguage: "python" }),
    );
    const p = loadProfile();
    expect(p.name).toBe("Old User");
    expect(p.character).toEqual({ style: "adventurer", seed: "guest" });
  });

  it("round-trips a saved character", () => {
    saveProfile({ character: { style: "bottts", seed: "custom-seed" } });
    const p = loadProfile();
    expect(p.character).toEqual({ style: "bottts", seed: "custom-seed" });
  });
});

describe("runs storage", () => {
  it("round-trips a run", () => {
    addRun(makeRun({ wpm: 80 }));
    const runs = loadRuns();
    expect(runs.length).toBe(1);
    expect(runs[0]?.wpm).toBe(80);
  });

  it("prepends newest first", () => {
    addRun(makeRun({ wpm: 10 }));
    addRun(makeRun({ wpm: 20 }));
    const runs = loadRuns();
    expect(runs[0]?.wpm).toBe(20);
    expect(runs[1]?.wpm).toBe(10);
  });

  it("caps at 200 runs", () => {
    for (let i = 0; i < 205; i++) addRun(makeRun());
    expect(loadRuns().length).toBe(200);
  });

  it("clears runs", () => {
    addRun(makeRun());
    clearRuns();
    expect(loadRuns().length).toBe(0);
  });

  it("returns empty on corrupted json", () => {
    localStorage.setItem("type-sprint:runs", "garbage");
    expect(loadRuns()).toEqual([]);
  });

  it("ignores invalid run objects", () => {
    // wpm as string should fail schema and not be stored
    addRun({ ...makeRun(), wpm: "fast" as unknown as number });
    expect(loadRuns().length).toBe(0);
  });
});

describe("daily storage", () => {
  function makeDaily(overrides: Partial<DailyResult> = {}): DailyResult {
    return {
      date: "2026-07-01",
      snippetId: "js-medium-001",
      bestWpm: 70,
      bestAccuracy: 95,
      attempts: 1,
      updatedAt: Date.now(),
      ...overrides,
    };
  }

  it("saves a first result", () => {
    saveDaily(makeDaily({ bestWpm: 70 }));
    const d = loadDaily("2026-07-01");
    expect(d?.bestWpm).toBe(70);
    expect(d?.attempts).toBe(1);
  });

  it("only overwrites when better and bumps attempts", () => {
    saveDaily(makeDaily({ bestWpm: 70, bestAccuracy: 95 }));
    saveDaily(makeDaily({ bestWpm: 60, bestAccuracy: 99 }));
    const d = loadDaily("2026-07-01");
    expect(d?.bestWpm).toBe(70); // kept the higher wpm
    expect(d?.bestAccuracy).toBe(99); // took the higher accuracy
    expect(d?.attempts).toBe(2);
  });

  it("returns null for a date with no result", () => {
    expect(loadDaily("1999-01-01")).toBeNull();
  });
});
