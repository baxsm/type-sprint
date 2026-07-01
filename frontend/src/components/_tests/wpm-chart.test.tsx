import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import WpmChart from "../wpm-chart";

describe("WpmChart", () => {
  it("shows an empty hint with too little data", () => {
    render(<WpmChart data={[{ x: 0, wpm: 40 }]} />);
    expect(screen.getByText(/complete a few runs/i)).toBeInTheDocument();
  });

  it("renders an svg chart with enough data", () => {
    render(
      <WpmChart
        data={[
          { x: 0, wpm: 40 },
          { x: 1, wpm: 55 },
          { x: 2, wpm: 60 },
        ]}
      />,
    );
    expect(screen.getByRole("img", { name: /wpm over time/i })).toBeInTheDocument();
  });
});
