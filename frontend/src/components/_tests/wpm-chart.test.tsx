import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { WpmSeriesPoint } from "@/lib/analytics";
import WpmChart from "../wpm-chart";

function makePoint(overrides: Partial<WpmSeriesPoint> = {}): WpmSeriesPoint {
  return {
    x: 0,
    wpm: 40,
    finishedAt: Date.now(),
    language: "javascript",
    mode: "practice",
    ...overrides,
  };
}

describe("WpmChart", () => {
  it("shows an empty hint with too little data", () => {
    render(<WpmChart data={[makePoint()]} />);
    expect(screen.getByText(/complete a few runs/i)).toBeInTheDocument();
  });

  it("renders a chart container with enough data", () => {
    render(
      <WpmChart
        data={[
          makePoint({ x: 0, wpm: 40 }),
          makePoint({ x: 1, wpm: 55 }),
          makePoint({ x: 2, wpm: 60 }),
        ]}
      />,
    );
    expect(screen.getByTestId("wpm-chart")).toBeInTheDocument();
  });

  it("shows tooltip content with run detail on hover", async () => {
    const { container } = render(
      <WpmChart
        data={[
          makePoint({ x: 0, wpm: 40, language: "python", mode: "daily" }),
          makePoint({ x: 1, wpm: 55, language: "python", mode: "daily" }),
        ]}
      />,
    );

    const chart = container.querySelector(".recharts-wrapper");
    expect(chart).toBeInTheDocument();
    if (chart) {
      fireEvent.mouseOver(chart);
      fireEvent.mouseMove(chart, { clientX: 50, clientY: 50 });
    }

    expect(await screen.findByText(/WPM$/)).toBeInTheDocument();
  });
});
