import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import ThemeToggle from "../theme-toggle";

beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");
  window.matchMedia = vi.fn().mockReturnValue({ matches: false }) as unknown as typeof window.matchMedia;
});

describe("ThemeToggle", () => {
  it("reflects the current theme via aria-label", () => {
    render(<ThemeToggle />);
    expect(screen.getByLabelText("Switch to dark theme")).toBeInTheDocument();
  });

  it("calls toggle on click and flips the label", () => {
    render(<ThemeToggle />);
    const btn = screen.getByLabelText("Switch to dark theme");
    fireEvent.click(btn);
    expect(screen.getByLabelText("Switch to light theme")).toBeInTheDocument();
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });
});
