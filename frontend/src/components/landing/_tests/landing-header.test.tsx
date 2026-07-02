import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import LandingHeader from "../landing-header";

describe("LandingHeader", () => {
  it("renders logo, theme toggle, and open app CTA", () => {
    render(<LandingHeader />);
    expect(screen.getByRole("link", { name: /type\s*sprint/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /toggle theme|switch to/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open app" })).toHaveAttribute("href", "/app");
  });

  it("has no mode links, unlike the app topbar", () => {
    render(<LandingHeader />);
    expect(screen.queryByRole("link", { name: "Practice" })).not.toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Daily" })).not.toBeInTheDocument();
  });
});
