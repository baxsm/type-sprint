"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  type TooltipContentProps,
  XAxis,
  YAxis,
} from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import Panel from "@/components/ui/panel";
import type { WpmSeriesPoint } from "@/lib/analytics";
import { formatDate } from "@/lib/utils";

type WpmChartProps = {
  data: WpmSeriesPoint[];
};

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  prose: "Prose",
};

const ChartTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload as WpmSeriesPoint | undefined;
  if (!point) return null;

  return (
    <div className="border-[3px] border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm shadow-[4px_4px_0_0_var(--color-ink)]">
      <div className="font-mono text-lg font-bold text-[var(--color-primary)]">{point.wpm} WPM</div>
      <div className="text-[var(--color-dim)]">
        {languageLabels[point.language] ?? point.language} - {point.mode}
      </div>
      <div className="text-[var(--color-muted)]">{formatDate(point.finishedAt)}</div>
    </div>
  );
};

const WpmChart = ({ data }: WpmChartProps) => {
  if (data.length < 2) {
    return (
      <Panel className="flex h-40 items-center justify-center text-sm text-[var(--color-dim)]">
        Complete a few runs to see your progress here.
      </Panel>
    );
  }

  return (
    <Panel className="h-52 p-4" data-testid="wpm-chart">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="wpmFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.25} />
              <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
          <XAxis dataKey="x" hide />
          <YAxis
            stroke="var(--color-muted)"
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            width={36}
          />
          <Tooltip content={ChartTooltip} cursor={{ stroke: "var(--color-primary)" }} />
          <Area
            type="monotone"
            dataKey="wpm"
            stroke="var(--color-primary)"
            strokeWidth={2}
            fill="url(#wpmFill)"
            activeDot={{ r: 4, fill: "var(--color-primary)" }}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
};

export default WpmChart;
