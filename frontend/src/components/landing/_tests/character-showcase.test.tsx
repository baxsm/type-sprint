import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import CharacterShowcase from "../character-showcase";

describe("CharacterShowcase", () => {
  it("renders a handful of dicebear avatars with a cta to the character picker", () => {
    render(<CharacterShowcase />);
    const avatars = screen.getAllByRole("img");
    expect(avatars.length).toBeGreaterThanOrEqual(4);
    expect(screen.getByRole("link", { name: /try the character picker/i })).toHaveAttribute(
      "href",
      "/app/character",
    );
  });
});
