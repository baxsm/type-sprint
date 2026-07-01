import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TypingHud from "../typing-hud";

describe("TypingHud", () => {
  it("renders the stat labels", () => {
    render(<TypingHud wpm={0} accuracy={100} elapsedMs={0} progress={0} />);
    expect(screen.getByText("WPM")).toBeInTheDocument();
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("Time")).toBeInTheDocument();
  });

  it("formats time as minutes and seconds", () => {
    render(<TypingHud wpm={40} accuracy={95} elapsedMs={65000} progress={50} />);
    expect(screen.getByText("1:05")).toBeInTheDocument();
  });
});
