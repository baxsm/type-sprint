"use client";

import { Label, Value } from "@/components/ui/typography";
import AnimatedNumber from "./animated-number";

type TypingHudProps = {
  wpm: number;
  accuracy: number;
  elapsedMs: number;
  progress: number; // 0-100
};

function formatTime(ms: number): string {
  const total = Math.floor(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const Stat = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <Value>{children}</Value>
  </div>
);

const TypingHud = ({ wpm, accuracy, elapsedMs, progress }: TypingHudProps) => {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-end gap-8">
        <Stat label="WPM">
          <AnimatedNumber value={wpm} />
        </Stat>
        <Stat label="Accuracy">
          <AnimatedNumber value={accuracy} decimals={0} />%
        </Stat>
        <Stat label="Time">{formatTime(elapsedMs)}</Stat>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full border-[2px] border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <div
          className="h-full bg-[var(--color-primary)] transition-[width] duration-200 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
};

export default TypingHud;
