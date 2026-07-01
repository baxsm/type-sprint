import { describe, expect, it } from "vitest";
import { getDailySnippet, getSnippet, getSnippetById, getSnippetsFor, todayStr } from "../snippets";

describe("getSnippet", () => {
  it("returns a snippet matching language and difficulty", () => {
    const snip = getSnippet("javascript", "easy");
    expect(snip.language).toBe("javascript");
    expect(snip.difficulty).toBe("easy");
  });

  it("covers all language and difficulty combos", () => {
    const langs = ["javascript", "python", "prose"] as const;
    const diffs = ["easy", "medium", "hard"] as const;
    for (const lang of langs) {
      for (const diff of diffs) {
        expect(getSnippetsFor(lang, diff).length).toBeGreaterThan(0);
      }
    }
  });

  it("can exclude a given id when the pool allows", () => {
    const first = getSnippet("javascript", "easy");
    // with more than one easy js snippet, exclusion should avoid a repeat
    const second = getSnippet("javascript", "easy", first.id);
    expect(second.id).not.toBe(first.id);
  });
});

describe("getSnippetById", () => {
  it("returns the snippet for a known id", () => {
    const snip = getSnippetById("js-easy-001");
    expect(snip).not.toBeNull();
    expect(snip?.id).toBe("js-easy-001");
  });

  it("returns null for an unknown id", () => {
    expect(getSnippetById("does-not-exist")).toBeNull();
  });
});

describe("getDailySnippet", () => {
  it("is deterministic for the same date", () => {
    const a = getDailySnippet("2026-07-01");
    const b = getDailySnippet("2026-07-01");
    expect(a.id).toBe(b.id);
  });

  it("returns a valid snippet", () => {
    const snip = getDailySnippet("2026-07-01");
    expect(snip.id).toBeTruthy();
    expect(snip.text.length).toBeGreaterThan(0);
  });

  it("can differ across dates", () => {
    const ids = new Set<string>();
    for (let d = 1; d <= 20; d++) {
      const dateStr = `2026-07-${String(d).padStart(2, "0")}`;
      ids.add(getDailySnippet(dateStr).id);
    }
    // over 20 days we expect more than one distinct snippet
    expect(ids.size).toBeGreaterThan(1);
  });
});

describe("todayStr", () => {
  it("formats a date as YYYY-MM-DD", () => {
    const d = new Date(2026, 6, 1); // july is month index 6
    expect(todayStr(d)).toBe("2026-07-01");
  });
});
