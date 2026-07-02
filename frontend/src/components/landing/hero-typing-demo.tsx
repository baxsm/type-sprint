"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef, useState } from "react";
import Panel from "@/components/ui/panel";

const DEMO_LINE = "const speed = practice + consistency;";

// a looping, auto-typing reveal, not a real scored run. no addRun, no storage,
// no keyboard capture - gsap drives the whole reveal timeline, css handles the
// caret blink via the same .caret-idle keyframe the real typing surface uses.
const HeroTypingDemo = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [revealed, setRevealed] = useState(0);

  useGSAP(
    () => {
      const chars = [...DEMO_LINE];
      const stepDuration = 0.055;
      const tl = gsap.timeline({ repeat: -1, repeatDelay: 1.5 });

      chars.forEach((_, i) => {
        tl.call(() => setRevealed(i + 1), undefined, i * stepDuration);
      });
      tl.to({}, { duration: 1 });
      tl.call(() => setRevealed(0), undefined, chars.length * stepDuration + 1);

      return () => {
        tl.kill();
      };
    },
    { scope: containerRef },
  );

  return (
    <div ref={containerRef} data-testid="hero-typing-demo">
      <Panel accent="primary" className="p-5 font-mono text-lg sm:text-xl">
        <span className="text-[var(--color-fg)]">{DEMO_LINE.slice(0, revealed)}</span>
        <span
          className="caret-idle inline-block w-[2px] translate-y-0.5 bg-[var(--color-primary)]"
          style={{ height: "1.1em" }}
          aria-hidden="true"
        />
        <span className="text-[var(--color-muted)]">{DEMO_LINE.slice(revealed)}</span>
      </Panel>
    </div>
  );
};

export default HeroTypingDemo;
