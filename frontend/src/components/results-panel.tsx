"use client";

import { motion } from "motion/react";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { Label, Value } from "@/components/ui/typography";
import type { FinishPayload } from "./typing-surface";

type ResultsPanelProps = {
  result: FinishPayload;
  onRestart: () => void;
  onNext?: () => void;
  extra?: React.ReactNode;
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col gap-1">
    <Label>{label}</Label>
    <Value className="text-3xl">{value}</Value>
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
    >
      <Panel className="flex flex-col gap-6 p-6">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3">
          <Metric label="WPM" value={String(stats.wpm)} />
          <Metric label="Accuracy" value={`${stats.accuracy}%`} />
          <Metric label="Raw WPM" value={String(stats.rawWpm)} />
          <Metric label="Consistency" value={`${consistency}%`} />
          <Metric label="Errors" value={String(errorCount)} />
          <Metric label="Time" value={`${seconds}s`} />
        </div>

        {extra}

        <div className="flex flex-wrap gap-3">
          <Button onClick={onRestart}>Try again</Button>
          {onNext && (
            <Button variant="secondary" onClick={onNext}>
              Next snippet
            </Button>
          )}
        </div>
      </Panel>
    </motion.div>
  );
};

export default ResultsPanel;
