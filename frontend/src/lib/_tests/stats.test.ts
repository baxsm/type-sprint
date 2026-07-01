import { describe, expect, it } from "vitest";
import { computeAccuracy, computeConsistency, computeWpm } from "../stats";

describe("computeWpm", () => {
  it("computes wpm for known char count and time", () => {
    // 50 chars = 10 words, in 60s = 10 wpm
    expect(computeWpm(50, 60000)).toBe(10);
  });

  it("returns 0 for zero elapsed", () => {
    expect(computeWpm(50, 0)).toBe(0);
  });

  it("returns 0 for zero chars", () => {
    expect(computeWpm(0, 60000)).toBe(0);
  });

  it("scales with time", () => {
    // 50 chars in 30s = 20 wpm
    expect(computeWpm(50, 30000)).toBe(20);
  });
});

describe("computeAccuracy", () => {
  it("computes accuracy for known correct and total", () => {
    expect(computeAccuracy(9, 10)).toBe(90);
  });

  it("returns 100 when nothing typed", () => {
    expect(computeAccuracy(0, 0)).toBe(100);
  });

  it("handles all correct", () => {
    expect(computeAccuracy(20, 20)).toBe(100);
  });
});

describe("computeConsistency", () => {
  it("returns 100 for a flat series", () => {
    expect(computeConsistency([50, 50, 50, 50])).toBe(100);
  });

  it("returns 100 for fewer than two samples", () => {
    expect(computeConsistency([50])).toBe(100);
    expect(computeConsistency([])).toBe(100);
  });

  it("returns lower for a variable series", () => {
    const flat = computeConsistency([50, 50, 50]);
    const variable = computeConsistency([10, 90, 30, 80]);
    expect(variable).toBeLessThan(flat);
  });
});
