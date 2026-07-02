import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Hero from "../hero";

describe("Hero", () => {
  it("renders headline, subhead, and primary CTA into /app", () => {
    render(<Hero />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/type faster/i);
    expect(screen.getByText(/typing game for code and prose/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open the app/i })).toHaveAttribute("href", "/app");
  });

  it("renders the typing demo without touching storage", () => {
    const setItemSpy = vi.spyOn(Object.getPrototypeOf(window.localStorage), "setItem");
    render(<Hero />);
    expect(screen.getByTestId("hero-typing-demo")).toBeInTheDocument();
    expect(setItemSpy).not.toHaveBeenCalled();
    setItemSpy.mockRestore();
  });
});
