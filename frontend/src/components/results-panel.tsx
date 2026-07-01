"use client";

import { motion } from "motion/react";
import type { FinishPayload } from "./typing-surface";

type ResultsPanelProps = {
  result: FinishPayload;
  onRestart: () => void;
  onNext?: () => void;
  extra?: React.ReactNode;
};

const Metric = ({ label, value, accent }: { label: string; value: string; accent?: boolean }) => (
  <div className="flex flex-col gap-1">
    <span className="text-xs uppercase tracking-wide text-[var(--color-dim)]">{label}</span>
    <span
      className="font-mono text-3xl font-bold"
      style={accent ? { color: "var(--color-accent)" } : undefined}
    >
      {value}
    </span>
  </div>
);

const ResultsPanel = ({ result, onRestart, onNext, extra }: ResultsPanelProps) => {
  const { stats, consistency, errorCount } = result;
  const seconds = Math.round(stats.elapsedMs / 100) / 10;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col gap-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
    >
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
        <Metric label="WPM" value={String(stats.wpm)} accent />
        <Metric label="Accuracy" value={`${stats.accuracy}%`} />
        <Metric label="Raw WPM" value={String(stats.rawWpm)} />
        <Metric label="Consistency" value={`${consistency}%`} />
        <Metric label="Errors" value={String(errorCount)} />
        <Metric label="Time" value={`${seconds}s`} />
      </div>

      {extra}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onRestart}
          className="rounded-lg bg-[var(--color-accent)] px-5 py-2 font-medium text-white transition-opacity hover:opacity-90"
        >
          Try again
        </button>
        {onNext && (
          <button
            type="button"
            onClick={onNext}
            className="rounded-lg border border-[var(--color-border)] px-5 py-2 font-medium text-[var(--color-fg)] transition-colors hover:border-[var(--color-dim)]"
          >
            Next snippet
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ResultsPanel;
