import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { DailyStore } from "@/lib/types";
import StreakCalendar from "../streak-calendar";

function makeResult(date: string, bestWpm = 70) {
  return {
    date,
    snippetId: "js-easy-001",
    bestWpm,
    bestAccuracy: 95,
    attempts: 1,
    updatedAt: Date.now(),
  };
}

describe("StreakCalendar", () => {
  it("marks today distinctly from other states", () => {
    const store: DailyStore = {};
    render(<StreakCalendar store={store} today="2026-07-02" />);
    const today = document.querySelector('[data-state="today"]');
    expect(today).toBeInTheDocument();
    expect(screen.getByText("Play")).toBeInTheDocument();
  });

  it("shows today's wpm once played, staying in the today state", () => {
    const store: DailyStore = { "2026-07-02": makeResult("2026-07-02", 91) };
    render(<StreakCalendar store={store} today="2026-07-02" />);
    const today = document.querySelector('[data-state="today"]');
    expect(today).toBeInTheDocument();
    expect(screen.getByText("91")).toBeInTheDocument();
    expect(screen.queryByText("Play")).not.toBeInTheDocument();
  });

  it("marks a played day as completed and shows its best wpm", () => {
    const store: DailyStore = { "2026-07-01": makeResult("2026-07-01", 82) };
    render(<StreakCalendar store={store} today="2026-07-02" />);
    const completed = document.querySelector('[data-state="completed"]');
    expect(completed).toBeInTheDocument();
    expect(screen.getByText("82")).toBeInTheDocument();
  });

  it("marks an unplayed past day as missed", () => {
    const store: DailyStore = {};
    render(<StreakCalendar store={store} today="2026-07-02" />);
    const missed = document.querySelectorAll('[data-state="missed"]');
    expect(missed.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Missed").length).toBeGreaterThan(0);
  });

  it("marks a day after today as future and locked", () => {
    const store: DailyStore = {};
    render(<StreakCalendar store={store} today="2026-07-02" />);
    const future = document.querySelectorAll('[data-state="future"]');
    expect(future.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Locked").length).toBeGreaterThan(0);
  });

  it("uses distinct classes per state", () => {
    const store: DailyStore = { "2026-07-01": makeResult("2026-07-01") };
    render(<StreakCalendar store={store} today="2026-07-02" />);
    const today = document.querySelector('[data-state="today"]') as HTMLElement;
    const completed = document.querySelector('[data-state="completed"]') as HTMLElement;
    const missed = document.querySelector('[data-state="missed"]') as HTMLElement;
    const future = document.querySelector('[data-state="future"]') as HTMLElement;
    expect(today.className).not.toBe(completed.className);
    expect(completed.className).not.toBe(missed.className);
    expect(missed.className).not.toBe(future.className);
  });
});
