"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import Panel from "@/components/ui/panel";
import { cn } from "@/lib/utils";

export type Lane = {
  name: string;
  progress: number;
  wpm: number;
  isSelf: boolean;
  finished: boolean;
};

const PlayerLane = ({ lane }: { lane: Lane }) => {
  const accent = lane.isSelf ? "var(--color-primary)" : "var(--color-opponent)";
  const fillRef = useRef<HTMLDivElement>(null);
  const wasFinished = useRef(false);

  useGSAP(
    () => {
      const fill = fillRef.current;
      if (!fill) return;
      gsap.to(fill, {
        width: `${Math.min(100, Math.max(0, lane.progress))}%`,
        duration: 0.25,
        ease: "power2.out",
      });

      // a quick pulse the moment this lane crosses the finish line
      if (lane.finished && !wasFinished.current) {
        wasFinished.current = true;
        gsap.fromTo(
          fill,
          { filter: "brightness(1)" },
          {
            filter: "brightness(1.6)",
            duration: 0.15,
            yoyo: true,
            repeat: 3,
            ease: "power1.inOut",
          },
        );
      }
    },
    { dependencies: [lane.progress, lane.finished], scope: fillRef },
  );

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="flex min-w-0 items-center gap-2">
          <span
            className="h-2.5 w-2.5 shrink-0 border-[2px] border-[var(--color-ink)]"
            style={{ backgroundColor: accent }}
          />
          <span className="truncate font-semibold">
            {lane.name}
            {lane.isSelf && <span className="ml-1 text-[var(--color-dim)]">(you)</span>}
          </span>
        </span>
        <span className="shrink-0 font-mono text-[var(--color-dim)]">
          {lane.finished ? "done" : `${lane.wpm} wpm`}
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden border-[2px] border-[var(--color-border)] bg-[var(--color-surface-raised)]">
        <div ref={fillRef} className={cn("h-full")} style={{ width: 0, backgroundColor: accent }} />
      </div>
    </div>
  );
};

const RaceTrack = ({ lanes }: { lanes: Lane[] }) => {
  return (
    <Panel className="flex flex-col gap-4 p-5">
      {lanes.map((lane, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: at most two fixed lanes, order is stable
        <PlayerLane key={`${lane.name}-${i}`} lane={lane} />
      ))}
    </Panel>
  );
};

export default RaceTrack;
