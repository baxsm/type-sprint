import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AVATAR_STYLES } from "@/lib/character";
import CharacterAvatar from "../character-avatar";

describe("CharacterAvatar", () => {
  it("renders an img with a data uri src", () => {
    const { container } = render(
      <CharacterAvatar character={{ style: "adventurer", seed: "hello" }} />,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toMatch(/^data:image\/svg\+xml/);
  });

  it("applies the given size", () => {
    const { container } = render(
      <CharacterAvatar character={{ style: "adventurer", seed: "hello" }} sizePx={64} />,
    );
    const img = container.querySelector("img");
    expect(img?.getAttribute("width")).toBe("64");
    expect(img?.getAttribute("height")).toBe("64");
  });

  it("renders without throwing for every curated style", () => {
    for (const { value } of AVATAR_STYLES) {
      expect(() =>
        render(<CharacterAvatar character={{ style: value, seed: "sample" }} />),
      ).not.toThrow();
    }
  });
});
