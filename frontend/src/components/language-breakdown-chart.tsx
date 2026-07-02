"use client";

import type { TooltipContentProps } from "recharts";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import Panel from "@/components/ui/panel";
import type { LanguageStat } from "@/lib/analytics";

type LanguageBreakdownChartProps = {
  data: LanguageStat[];
};

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  prose: "Prose",
};

const BreakdownTooltip = ({ active, payload }: TooltipContentProps<ValueType, NameType>) => {
  if (!active || !payload?.length) return null;
  const stat = payload[0]?.payload as LanguageStat | undefined;
  if (!stat) return null;

  return (
    <div className="border-[3px] border-[var(--color-border)] bg-[var(--color-surface-raised)] px-3 py-2 text-sm shadow-[4px_4px_0_0_var(--color-ink)]">
      <div className="font-semibold text-[var(--color-fg)]">
        {languageLabels[stat.language] ?? stat.language}
      </div>
      <div className="font-mono text-[var(--color-primary)]">avg {stat.avgWpm} WPM</div>
      <div className="text-[var(--color-dim)]">
        best {stat.bestWpm} - {stat.runs} {stat.runs === 1 ? "run" : "runs"}
      </div>
    </div>
  );
};

const LanguageBreakdownChart = ({ data }: LanguageBreakdownChartProps) => {
  if (data.length === 0) {
    return (
      <Panel className="flex h-40 items-center justify-center text-sm text-[var(--color-dim)]">
        Complete a few runs to see your language breakdown here.
      </Panel>
    );
  }

  const chartData = data.map((stat) => ({
    ...stat,
    label: languageLabels[stat.language] ?? stat.language,
  }));

  return (
    <Panel className="h-52 p-4" data-testid="language-breakdown-chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="4 4" vertical={false} />
          <XAxis
            dataKey="label"
            stroke="var(--color-muted)"
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
          />
          <YAxis
            stroke="var(--color-muted)"
            tick={{ fill: "var(--color-muted)", fontSize: 12 }}
            width={36}
          />
          <Tooltip content={BreakdownTooltip} cursor={{ fill: "var(--color-accent-soft)" }} />
          <Bar dataKey="avgWpm" fill="var(--color-primary)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
};

export default LanguageBreakdownChart;
