"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";

type RaceCountdownProps = {
  value: number;
};

// gsap drives this because it needs a precise, punchy slam-in per tick,
// not a react-state-driven transition. one timeline per tick, auto cleaned up.
const RaceCountdown = ({ value }: RaceCountdownProps) => {
  const ref = useRef<HTMLSpanElement>(null);
  const isGo = value <= 0;

  useGSAP(
    () => {
      if (!ref.current) return;
      gsap.fromTo(
        ref.current,
        { scale: isGo ? 0.4 : 0.6, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: isGo ? 0.35 : 0.25,
          ease: isGo ? "back.out(3)" : "back.out(2)",
        },
      );
    },
    { dependencies: [value], scope: ref },
  );

  return (
    <div className="flex items-center justify-center py-6">
      <span ref={ref} className="font-mono text-6xl font-bold text-[var(--color-accent)]">
        {isGo ? "Go" : value}
      </span>
    </div>
  );
};

export default RaceCountdown;
