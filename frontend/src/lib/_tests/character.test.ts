import { describe, expect, it } from "vitest";
import { AVATAR_STYLES, randomSeed, renderAvatar } from "../character";

describe("renderAvatar", () => {
  it("is deterministic for the same style and seed", () => {
    const character = { style: "adventurer" as const, seed: "hello" };
    expect(renderAvatar(character)).toBe(renderAvatar(character));
  });

  it("differs for different seeds", () => {
    const a = renderAvatar({ style: "adventurer", seed: "hello" });
    const b = renderAvatar({ style: "adventurer", seed: "world" });
    expect(a).not.toBe(b);
  });

  it("differs for different styles with the same seed", () => {
    const a = renderAvatar({ style: "adventurer", seed: "hello" });
    const b = renderAvatar({ style: "bottts", seed: "hello" });
    expect(a).not.toBe(b);
  });

  it("renders every curated style without throwing", () => {
    for (const { value } of AVATAR_STYLES) {
      expect(() => renderAvatar({ style: value, seed: "sample" })).not.toThrow();
    }
  });

  it("returns a data uri", () => {
    const result = renderAvatar({ style: "adventurer", seed: "hello" });
    expect(result.startsWith("data:image/svg+xml")).toBe(true);
  });
});

describe("randomSeed", () => {
  it("returns a non-empty string", () => {
    expect(randomSeed().length).toBeGreaterThan(0);
  });

  it("varies across calls", () => {
    const seeds = new Set(Array.from({ length: 20 }, () => randomSeed()));
    expect(seeds.size).toBeGreaterThan(1);
  });
});
