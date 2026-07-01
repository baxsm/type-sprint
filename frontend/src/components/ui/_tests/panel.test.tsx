import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Panel from "../panel";

describe("Panel", () => {
  it("renders children", () => {
    render(<Panel>content</Panel>);
    expect(screen.getByText("content")).toBeInTheDocument();
  });

  it("renders a border and offset shadow", () => {
    render(<Panel data-testid="panel">content</Panel>);
    const panel = screen.getByTestId("panel");
    expect(panel.className).toContain("border-[3px]");
    expect(panel.className).toContain("shadow-[6px_6px_0_0_var(--color-ink)]");
  });

  it("applies the accent border color variant", () => {
    render(
      <Panel accent="primary" data-testid="panel">
        content
      </Panel>,
    );
    expect(screen.getByTestId("panel").className).toContain("border-[var(--color-primary)]");
  });
});
