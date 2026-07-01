import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RaceTrack, { type Lane } from "../race-track";

const alice: Lane = {
  name: "Alice",
  character: { style: "adventurer", seed: "alice" },
  progress: 40,
  wpm: 55,
  isSelf: true,
  finished: false,
};
const bob: Lane = {
  name: "Bob",
  character: { style: "bottts", seed: "bob" },
  progress: 20,
  wpm: 45,
  isSelf: false,
  finished: false,
};
const lanes: Lane[] = [alice, bob];

describe("RaceTrack", () => {
  it("renders a lane per player", () => {
    render(<RaceTrack lanes={lanes} />);
    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("Bob")).toBeInTheDocument();
  });

  it("marks the self lane", () => {
    render(<RaceTrack lanes={lanes} />);
    expect(screen.getByText("(you)")).toBeInTheDocument();
  });

  it("shows done when a player finished", () => {
    render(<RaceTrack lanes={[{ ...alice, finished: true }, bob]} />);
    expect(screen.getByText("done")).toBeInTheDocument();
  });

  it("shows live wpm when not finished", () => {
    render(<RaceTrack lanes={lanes} />);
    expect(screen.getByText("55 wpm")).toBeInTheDocument();
  });

  it("renders a character avatar for both self and opponent lanes", () => {
    const { container } = render(<RaceTrack lanes={lanes} />);
    const imgs = container.querySelectorAll("img");
    expect(imgs.length).toBe(2);
    for (const img of imgs) {
      expect(img.getAttribute("src")).toMatch(/^data:image\/svg\+xml/);
    }
  });

  it("does not crash when a player is missing character data", () => {
    const withoutCharacter = { ...alice, character: undefined } as unknown as Lane;
    expect(() => render(<RaceTrack lanes={[withoutCharacter, bob]} />)).not.toThrow();
  });
});
