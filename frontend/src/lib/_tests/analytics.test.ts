import { describe, expect, it } from "vitest";
import { byLanguage, summarize, wpmSeries } from "../analytics";
import type { Run } from "../types";

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

describe("summarize", () => {
  it("returns zeros for no runs", () => {
    const s = summarize([]);
    expect(s).toEqual({ bestWpm: 0, avgWpm: 0, avgAccuracy: 0, totalRuns: 0 });
  });

  it("computes best, average, and total", () => {
    const s = summarize([makeRun({ wpm: 50, accuracy: 90 }), makeRun({ wpm: 70, accuracy: 100 })]);
    expect(s.bestWpm).toBe(70);
    expect(s.avgWpm).toBe(60);
    expect(s.avgAccuracy).toBe(95);
    expect(s.totalRuns).toBe(2);
  });
});

describe("byLanguage", () => {
  it("groups and sorts by run count", () => {
    const stats = byLanguage([
      makeRun({ language: "javascript", wpm: 60 }),
      makeRun({ language: "javascript", wpm: 80 }),
      makeRun({ language: "python", wpm: 50 }),
    ]);
    expect(stats[0]?.language).toBe("javascript");
    expect(stats[0]?.runs).toBe(2);
    expect(stats[0]?.avgWpm).toBe(70);
    expect(stats[0]?.bestWpm).toBe(80);
    expect(stats[1]?.language).toBe("python");
  });

  it("returns empty for no runs", () => {
    expect(byLanguage([])).toEqual([]);
  });
});

describe("wpmSeries", () => {
  it("orders oldest to newest", () => {
    const series = wpmSeries([
      makeRun({ finishedAt: 3000, wpm: 30 }),
      makeRun({ finishedAt: 1000, wpm: 10 }),
      makeRun({ finishedAt: 2000, wpm: 20 }),
    ]);
    expect(series.map((p) => p.wpm)).toEqual([10, 20, 30]);
  });

  it("respects the limit", () => {
    const runs = Array.from({ length: 40 }, (_, i) => makeRun({ finishedAt: i * 1000, wpm: i }));
    expect(wpmSeries(runs, 10).length).toBe(10);
  });
});
