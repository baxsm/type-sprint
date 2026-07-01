import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ResultsPanel from "../results-panel";
import type { FinishPayload } from "../typing-surface";

const result: FinishPayload = {
  stats: { wpm: 72, rawWpm: 75, accuracy: 96, elapsedMs: 8300 },
  consistency: 88,
  charCount: 50,
  errorCount: 2,
};

describe("ResultsPanel", () => {
  it("shows the computed stats", () => {
    render(<ResultsPanel result={result} onRestart={() => {}} />);
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("96%")).toBeInTheDocument();
    expect(screen.getByText("88%")).toBeInTheDocument();
  });

  it("calls onRestart when try again is clicked", () => {
    const onRestart = vi.fn();
    render(<ResultsPanel result={result} onRestart={onRestart} />);
    fireEvent.click(screen.getByText("Try again"));
    expect(onRestart).toHaveBeenCalled();
  });

  it("shows next button only when onNext is given", () => {
    const { rerender } = render(<ResultsPanel result={result} onRestart={() => {}} />);
    expect(screen.queryByText("Next snippet")).not.toBeInTheDocument();
    rerender(<ResultsPanel result={result} onRestart={() => {}} onNext={() => {}} />);
    expect(screen.getByText("Next snippet")).toBeInTheDocument();
  });
});
