import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ClosingCta from "../closing-cta";

describe("ClosingCta", () => {
  it("renders a final push into the app", () => {
    render(<ClosingCta />);
    expect(screen.getByRole("link", { name: /open the app/i })).toHaveAttribute("href", "/app");
  });
});
