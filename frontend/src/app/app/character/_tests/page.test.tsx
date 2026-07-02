import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { loadProfile } from "@/lib/storage";
import CharacterPage from "../page";

beforeEach(() => {
  localStorage.clear();
});

describe("CharacterPage", () => {
  it("renders one tile per curated style", () => {
    render(<CharacterPage />);
    expect(screen.getByRole("button", { name: /adventurer/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /bottts/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /pixel art/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /thumbs/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /notionists/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /big smile/i })).toBeInTheDocument();
  });

  it("shuffle changes the seed input value without changing the style", () => {
    render(<CharacterPage />);
    const seedInput = screen.getByLabelText("Seed") as HTMLInputElement;
    const before = seedInput.value;
    fireEvent.click(screen.getByRole("button", { name: "Shuffle" }));
    expect(seedInput.value).not.toBe(before);
  });

  it("typing a custom seed updates the input", () => {
    render(<CharacterPage />);
    const seedInput = screen.getByLabelText("Seed") as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: "my-custom-seed" } });
    expect(seedInput.value).toBe("my-custom-seed");
  });

  it("save persists the selected style and seed to the profile", () => {
    render(<CharacterPage />);
    fireEvent.click(screen.getByRole("button", { name: /bottts/i }));
    const seedInput = screen.getByLabelText("Seed") as HTMLInputElement;
    fireEvent.change(seedInput, { target: { value: "my-custom-seed" } });
    fireEvent.click(screen.getByRole("button", { name: "Save" }));

    const profile = loadProfile();
    expect(profile.character).toEqual({ style: "bottts", seed: "my-custom-seed" });
    expect(screen.getByText("Saved.")).toBeInTheDocument();
  });
});
