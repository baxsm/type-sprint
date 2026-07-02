import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FeatureSequence from "../feature-sequence";

describe("FeatureSequence", () => {
  it("renders all four feature highlights as a list, not a card grid", () => {
    render(<FeatureSequence />);
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Solo practice" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Daily challenge" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Real-time race" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /stats that mean something/i })).toBeInTheDocument();
  });
});
