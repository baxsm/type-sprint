"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import LanguageBreakdownChart from "@/components/language-breakdown-chart";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { Label, Subtitle, Title, Value } from "@/components/ui/typography";
import WpmChart from "@/components/wpm-chart";
import { byLanguage, summarize, wpmSeries } from "@/lib/analytics";
import { clearRuns, loadRuns } from "@/lib/storage";
import type { Run } from "@/lib/types";
import { formatDate } from "@/lib/utils";

const languageLabels: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  prose: "Prose",
};

export default function StatsPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    setRuns(loadRuns());
    setLoaded(true);
  }, []);

  const doClear = () => {
    clearRuns();
    setRuns([]);
    setConfirmClear(false);
  };

  if (!loaded) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-dim)]">
        Loading stats...
      </div>
    );
  }

  if (runs.length === 0) {
    return (
      <Panel className="flex flex-col items-center gap-4 px-6 py-16 text-center">
        <Title as="h1" className="text-2xl">
          No runs yet
        </Title>
        <Subtitle className="max-w-sm">
          Your typing stats and history will show up here once you complete a run.
        </Subtitle>
        <Link href="/practice">
          <Button>Start practicing</Button>
        </Link>
      </Panel>
    );
  }

  const summary = summarize(runs);
  const series = wpmSeries(runs);
  const langStats = byLanguage(runs);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <Title as="h1" className="text-2xl">
          Your Stats
        </Title>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="border-[3px] border-[var(--color-border)] px-3 py-1.5 text-sm font-semibold text-[var(--color-dim)] transition-colors hover:border-[var(--color-incorrect)] hover:text-[var(--color-incorrect)]"
        >
          Clear history
        </button>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Best WPM" value={summary.bestWpm} />
        <SummaryCard label="Avg WPM" value={summary.avgWpm} />
        <SummaryCard label="Avg Accuracy" value={`${summary.avgAccuracy}%`} />
        <SummaryCard label="Total Runs" value={summary.totalRuns} />
      </section>

      <section className="flex flex-col gap-3">
        <Label>WPM over time</Label>
        <WpmChart data={series} />
      </section>

      <section className="flex flex-col gap-3">
        <Label>By language</Label>
        <div className="grid gap-4 lg:grid-cols-2">
          <LanguageBreakdownChart data={langStats} />
          {langStats.length > 0 && (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
              {langStats.map((ls) => (
                <Panel key={ls.language} className="flex flex-col gap-1 p-4">
                  <span className="font-semibold">
                    {languageLabels[ls.language] ?? ls.language}
                  </span>
                  <span className="text-sm text-[var(--color-dim)]">
                    {ls.runs} {ls.runs === 1 ? "run" : "runs"} - best {ls.bestWpm} - avg {ls.avgWpm}{" "}
                    WPM
                  </span>
                </Panel>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <Label>Recent runs</Label>
        <Panel className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b-[2px] border-[var(--color-border)] text-[var(--color-dim)]">
                <th className="px-4 py-2 font-medium">Mode</th>
                <th className="px-4 py-2 font-medium">Language</th>
                <th className="px-4 py-2 font-medium">Difficulty</th>
                <th className="px-4 py-2 font-medium">WPM</th>
                <th className="px-4 py-2 font-medium">Accuracy</th>
                <th className="px-4 py-2 font-medium">When</th>
              </tr>
            </thead>
            <tbody>
              {runs.slice(0, 25).map((run) => (
                <tr
                  key={run.id}
                  className="border-b-[2px] border-[var(--color-border)] last:border-0"
                >
                  <td className="px-4 py-2 capitalize">{run.mode}</td>
                  <td className="px-4 py-2">{languageLabels[run.language] ?? run.language}</td>
                  <td className="px-4 py-2 capitalize">{run.difficulty}</td>
                  <td className="px-4 py-2 font-mono font-semibold text-[var(--color-primary)]">
                    {run.wpm}
                  </td>
                  <td className="px-4 py-2 font-mono">{run.accuracy}%</td>
                  <td className="px-4 py-2 text-[var(--color-dim)]">
                    {formatDate(run.finishedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
      </section>

      {confirmClear && <ClearDialog onCancel={() => setConfirmClear(false)} onConfirm={doClear} />}
    </div>
  );
}

const SummaryCard = ({ label, value }: { label: string; value: string | number }) => (
  <Panel className="flex flex-col gap-1 p-4">
    <Label>{label}</Label>
    <Value className="text-2xl">{value}</Value>
  </Panel>
);

const ClearDialog = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <div
    className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Clear history"
  >
    <Panel className="flex w-full max-w-sm flex-col gap-4 p-6">
      <Title as="h3" className="text-lg">
        Clear all history?
      </Title>
      <Subtitle className="text-sm">
        This removes every saved run from this browser. It cannot be undone.
      </Subtitle>
      <div className="flex justify-end gap-3">
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          Clear history
        </Button>
      </div>
    </Panel>
  </div>
);
