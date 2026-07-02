import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import StreakBadge from "../streak-badge";

describe("StreakBadge", () => {
  it("displays current and longest streak values", () => {
    render(<StreakBadge streak={{ current: 3, longest: 7, playedDates: [] }} />);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    expect(screen.getByText("Current streak")).toBeInTheDocument();
    expect(screen.getByText("Longest streak")).toBeInTheDocument();
  });

  it("displays zero streaks correctly", () => {
    render(<StreakBadge streak={{ current: 0, longest: 0, playedDates: [] }} />);
    expect(screen.getAllByText("0").length).toBe(2);
  });
});
