"use client";

import Panel from "@/components/ui/panel";

type WpmChartProps = {
  data: { x: number; wpm: number }[];
};

// lightweight inline svg line chart, no chart library needed
const WpmChart = ({ data }: WpmChartProps) => {
  if (data.length < 2) {
    return (
      <Panel className="flex h-40 items-center justify-center text-sm text-[var(--color-dim)]">
        Complete a few runs to see your progress here.
      </Panel>
    );
  }

  const width = 600;
  const height = 160;
  const pad = 12;
  const maxWpm = Math.max(...data.map((d) => d.wpm), 1);
  const stepX = (width - pad * 2) / (data.length - 1);

  const points = data.map((d, i) => {
    const x = pad + i * stepX;
    const y = height - pad - (d.wpm / maxWpm) * (height - pad * 2);
    return { x, y };
  });

  const path = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");

  const areaPath = `${path} L ${points[points.length - 1]?.x.toFixed(1)} ${
    height - pad
  } L ${points[0]?.x.toFixed(1)} ${height - pad} Z`;

  return (
    <Panel className="p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-40 w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="WPM over time"
      >
        <title>WPM over time</title>
        <path d={areaPath} fill="var(--color-primary)" opacity="0.12" />
        <path
          d={path}
          fill="none"
          stroke="var(--color-primary)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        {points.map((p, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: points are a fixed ordered series
          <circle key={i} cx={p.x} cy={p.y} r="2.5" fill="var(--color-primary)" />
        ))}
      </svg>
    </Panel>
  );
};

export default WpmChart;
