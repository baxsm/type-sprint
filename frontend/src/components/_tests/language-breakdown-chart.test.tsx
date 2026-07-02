import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { LanguageStat } from "@/lib/analytics";
import LanguageBreakdownChart from "../language-breakdown-chart";

describe("LanguageBreakdownChart", () => {
  it("shows an empty hint with no language stats", () => {
    render(<LanguageBreakdownChart data={[]} />);
    expect(screen.getByText(/language breakdown/i)).toBeInTheDocument();
  });

  it("renders one bar per language present in the data", () => {
    const data: LanguageStat[] = [
      { language: "javascript", runs: 3, avgWpm: 60, bestWpm: 80 },
      { language: "python", runs: 1, avgWpm: 50, bestWpm: 50 },
    ];
    const { container } = render(<LanguageBreakdownChart data={data} />);
    expect(screen.getByTestId("language-breakdown-chart")).toBeInTheDocument();
    const bars = container.querySelectorAll(".recharts-bar-rectangle");
    expect(bars.length).toBe(2);
  });
});
