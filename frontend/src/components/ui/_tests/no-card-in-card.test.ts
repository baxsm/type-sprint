import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const SRC_DIR = join(__dirname, "..", "..", "..");

function collectTsxFiles(dir: string): string[] {
  const entries = readdirSync(dir, { withFileTypes: true });
  return entries.flatMap((entry) => {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) return collectTsxFiles(full);
    if (entry.name.endsWith(".tsx")) return [full];
    return [];
  });
}

describe("no card-in-card", () => {
  it("never renders a <Panel> directly inside another <Panel> in real usage", () => {
    const files = collectTsxFiles(SRC_DIR).filter((f) => !f.includes("_tests"));
    const offenders: string[] = [];

    for (const file of files) {
      const src = readFileSync(file, "utf-8");
      if (!src.includes("<Panel")) continue;
      // strip everything between the first Panel's children start and look for a nested opener
      // before the matching Panel closes at the same nesting depth. simple heuristic: any
      // "<Panel" appearing before the *next* "</Panel>" after a prior "<Panel" is nested.
      const opens = [...src.matchAll(/<Panel[\s>]/g)].map((m) => m.index ?? 0);
      const closes = [...src.matchAll(/<\/Panel>/g)].map((m) => m.index ?? 0);
      for (let i = 0; i < opens.length; i++) {
        const thisOpen = opens[i];
        const nextOpen = opens[i + 1];
        if (thisOpen === undefined || nextOpen === undefined) continue;
        const closingAfterThisOpen = closes.find((c) => c > thisOpen);
        if (closingAfterThisOpen !== undefined && nextOpen < closingAfterThisOpen) {
          offenders.push(file);
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});
