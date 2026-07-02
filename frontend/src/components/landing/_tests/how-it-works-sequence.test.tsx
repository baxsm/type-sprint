import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import HowItWorksSequence from "../how-it-works-sequence";

describe("HowItWorksSequence", () => {
  it("renders a numbered sequence of steps", () => {
    render(<HowItWorksSequence />);
    expect(screen.getByText("01")).toBeInTheDocument();
    expect(screen.getByText("02")).toBeInTheDocument();
    expect(screen.getByText("03")).toBeInTheDocument();
    expect(screen.getByText("04")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Pick a mode" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Race a friend" })).toBeInTheDocument();
  });
});
