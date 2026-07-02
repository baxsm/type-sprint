import { describe, expect, it } from "vitest";
import { computeStreak } from "../daily";
import type { DailyResult, DailyStore } from "../types";

function makeResult(date: string): DailyResult {
  return {
    date,
    snippetId: "js-easy-001",
    bestWpm: 60,
    bestAccuracy: 95,
    attempts: 1,
    updatedAt: Date.now(),
  };
}

function storeFrom(dates: string[]): DailyStore {
  const store: DailyStore = {};
  for (const date of dates) store[date] = makeResult(date);
  return store;
}

describe("computeStreak", () => {
  it("returns all zeros when no days played", () => {
    expect(computeStreak({}, "2026-07-02")).toEqual({
      current: 0,
      longest: 0,
      playedDates: [],
    });
  });

  it("counts a run of consecutive days ending today", () => {
    const store = storeFrom(["2026-06-30", "2026-07-01", "2026-07-02"]);
    const streak = computeStreak(store, "2026-07-02");
    expect(streak.current).toBe(3);
    expect(streak.longest).toBe(3);
  });

  it("breaks the current streak on a gap but keeps the longest from before it", () => {
    const store = storeFrom(["2026-06-20", "2026-06-21", "2026-06-22", "2026-07-02"]);
    const streak = computeStreak(store, "2026-07-02");
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(3);
  });

  it("yields current 1 when only today is played", () => {
    const store = storeFrom(["2026-07-02"]);
    const streak = computeStreak(store, "2026-07-02");
    expect(streak.current).toBe(1);
  });

  it("does not count today alone as continuing a nonexistent chain when yesterday is missing", () => {
    const store = storeFrom(["2026-06-25", "2026-07-02"]);
    const streak = computeStreak(store, "2026-07-02");
    expect(streak.current).toBe(1);
    expect(streak.longest).toBe(1);
  });

  it("returns current 0 when today is not played", () => {
    const store = storeFrom(["2026-07-01", "2026-06-30"]);
    const streak = computeStreak(store, "2026-07-02");
    expect(streak.current).toBe(0);
    expect(streak.longest).toBe(2);
  });

  it("returns sorted playedDates for calendar rendering", () => {
    const store = storeFrom(["2026-07-01", "2026-06-30", "2026-07-02"]);
    const streak = computeStreak(store, "2026-07-02");
    expect(streak.playedDates).toEqual(["2026-06-30", "2026-07-01", "2026-07-02"]);
  });
});
