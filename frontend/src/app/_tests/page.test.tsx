import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingPage from "../page";

describe("LandingPage", () => {
  it("renders all landing sections in order", () => {
    render(<LandingPage />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(/type faster/i);
    expect(
      screen.getByRole("heading", { name: /everything you need to get faster/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "How it works" })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /pick a face for your speed/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /ready to see your number/i })).toBeInTheDocument();
  });

  it("has exactly one h1", () => {
    render(<LandingPage />);
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
