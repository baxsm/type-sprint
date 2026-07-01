"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      <div className="flex flex-col items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-6 py-16 text-center">
        <h1 className="text-2xl font-bold">No runs yet</h1>
        <p className="max-w-sm text-[var(--color-dim)]">
          Your typing stats and history will show up here once you complete a run.
        </p>
        <Link
          href="/practice"
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2 font-medium text-white transition-opacity hover:opacity-90"
        >
          Start practicing
        </Link>
      </div>
    );
  }

  const summary = summarize(runs);
  const series = wpmSeries(runs);
  const langStats = byLanguage(runs);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Your Stats</h1>
        <button
          type="button"
          onClick={() => setConfirmClear(true)}
          className="rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-sm text-[var(--color-dim)] transition-colors hover:border-[var(--color-bad)] hover:text-[var(--color-bad)]"
        >
          Clear history
        </button>
      </div>

      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <SummaryCard label="Best WPM" value={summary.bestWpm} accent />
        <SummaryCard label="Avg WPM" value={summary.avgWpm} />
        <SummaryCard label="Avg Accuracy" value={`${summary.avgAccuracy}%`} />
        <SummaryCard label="Total Runs" value={summary.totalRuns} />
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-wide text-[var(--color-dim)]">WPM over time</h2>
        <WpmChart data={series} />
      </section>

      {langStats.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm uppercase tracking-wide text-[var(--color-dim)]">By language</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {langStats.map((ls) => (
              <div
                key={ls.language}
                className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4"
              >
                <span className="font-medium">{languageLabels[ls.language] ?? ls.language}</span>
                <span className="text-sm text-[var(--color-dim)]">
                  {ls.runs} {ls.runs === 1 ? "run" : "runs"} - best {ls.bestWpm} - avg {ls.avgWpm}{" "}
                  WPM
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <h2 className="text-sm uppercase tracking-wide text-[var(--color-dim)]">Recent runs</h2>
        <div className="overflow-x-auto rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full min-w-[560px] text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] text-[var(--color-dim)]">
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
                <tr key={run.id} className="border-b border-[var(--color-border)] last:border-0">
                  <td className="px-4 py-2 capitalize">{run.mode}</td>
                  <td className="px-4 py-2">{languageLabels[run.language] ?? run.language}</td>
                  <td className="px-4 py-2 capitalize">{run.difficulty}</td>
                  <td className="px-4 py-2 font-mono font-semibold text-[var(--color-accent)]">
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
        </div>
      </section>

      {confirmClear && <ClearDialog onCancel={() => setConfirmClear(false)} onConfirm={doClear} />}
    </div>
  );
}

const SummaryCard = ({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) => (
  <div className="flex flex-col gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
    <span className="text-xs uppercase tracking-wide text-[var(--color-dim)]">{label}</span>
    <span
      className="font-mono text-2xl font-bold"
      style={accent ? { color: "var(--color-accent)" } : undefined}
    >
      {value}
    </span>
  </div>
);

const ClearDialog = ({ onCancel, onConfirm }: { onCancel: () => void; onConfirm: () => void }) => (
  <div
    className="fixed inset-0 z-30 flex items-center justify-center bg-black/60 p-4"
    role="dialog"
    aria-modal="true"
    aria-label="Clear history"
  >
    <div className="flex w-full max-w-sm flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-raised)] p-6">
      <h3 className="text-lg font-semibold">Clear all history?</h3>
      <p className="text-sm text-[var(--color-dim)]">
        This removes every saved run from this browser. It cannot be undone.
      </p>
      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm transition-colors hover:border-[var(--color-dim)]"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="rounded-lg bg-[var(--color-bad)] px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Clear history
        </button>
      </div>
    </div>
  </div>
);
