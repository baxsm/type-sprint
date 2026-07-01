"use client";

import { cn } from "@/lib/utils";

export type Lane = {
  name: string;
  progress: number;
  wpm: number;
  isSelf: boolean;
  finished: boolean;
};

const PlayerLane = ({ lane }: { lane: Lane }) => {
  const accent = lane.isSelf ? "var(--color-accent)" : "var(--color-opponent)";
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: accent }} />
          <span className="truncate font-medium">
            {lane.name}
            {lane.isSelf && <span className="ml-1 text-[var(--color-dim)]">(you)</span>}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[var(--color-dim)]">
          {lane.finished ? "done" : `${lane.wpm} wpm`}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-[var(--color-surface-raised)]">
        <div
          className={cn("h-full rounded-full transition-[width] duration-200 ease-out")}
          style={{
            width: `${Math.min(100, Math.max(0, lane.progress))}%`,
            backgroundColor: accent,
          }}
        />
      </div>
    </div>
  );
};

const RaceTrack = ({ lanes }: { lanes: Lane[] }) => {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
      {lanes.map((lane, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: at most two fixed lanes, order is stable
        <PlayerLane key={`${lane.name}-${i}`} lane={lane} />
      ))}
    </div>
  );
};

export default RaceTrack;
