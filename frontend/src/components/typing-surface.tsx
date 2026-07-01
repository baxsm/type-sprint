"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { computeConsistency } from "@/lib/stats";
import type { CharState, LiveStats, TypingState } from "@/lib/types";
import { createTypingSession, type TypingSession } from "@/lib/typing-engine";
import { cn } from "@/lib/utils";

export type FinishPayload = {
  stats: LiveStats;
  consistency: number;
  charCount: number;
  errorCount: number;
};

type TypingSurfaceProps = {
  text: string;
  // called on every keystroke with fresh state and stats, for live HUD and race progress
  onProgress?: (state: TypingState, stats: LiveStats) => void;
  onFinish?: (payload: FinishPayload) => void;
  // when true, keystrokes are ignored (countdown, waiting)
  disabled?: boolean;
  autoFocus?: boolean;
  // overlay text shown while disabled, e.g. "Get ready..." during a race countdown.
  // defaults to the normal "click to focus" hint.
  lockedMessage?: string;
};

const stateClass: Record<CharState, string> = {
  untyped: "text-[var(--color-muted)]",
  correct: "text-[var(--color-fg)]",
  incorrect: "text-[var(--color-bad)] bg-[var(--color-bad)]/10 rounded-sm",
  current: "text-[var(--color-fg)]",
};

const TypingSurface = ({
  text,
  onProgress,
  onFinish,
  disabled = false,
  autoFocus = true,
  lockedMessage,
}: TypingSurfaceProps) => {
  const sessionRef = useRef<TypingSession>(createTypingSession(text));
  const containerRef = useRef<HTMLDivElement>(null);
  const currentCharRef = useRef<HTMLSpanElement>(null);
  const finishedRef = useRef(false);
  const [state, setState] = useState<TypingState>(() => sessionRef.current.state());
  const [shakeIndex, setShakeIndex] = useState<number | null>(null);
  const [focused, setFocused] = useState(false);

  // rebuild the session whenever the target text changes
  useEffect(() => {
    sessionRef.current = createTypingSession(text);
    finishedRef.current = false;
    setState(sessionRef.current.state());
    setShakeIndex(null);
  }, [text]);

  const emitFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    const session = sessionRef.current;
    const s = session.state();
    const stats = session.stats();
    const errorCount = s.states.filter((c) => c === "incorrect").length;
    onFinish?.({
      stats,
      consistency: computeConsistency(session.wpmSamples()),
      charCount: [...text].length,
      errorCount,
    });
  }, [onFinish, text]);

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (disabled || finishedRef.current) return;

      const session = sessionRef.current;

      if (e.key === "Backspace") {
        e.preventDefault();
        session.backspace();
        const next = session.state();
        setState(next);
        onProgress?.(next, session.stats());
        return;
      }

      // enter maps to the newline character in code snippets
      let char: string | null = null;
      if (e.key === "Enter") char = "\n";
      else if (e.key.length === 1) char = e.key;

      if (char === null) return;
      e.preventDefault();

      const before = session.state().caret;
      const expected = [...text][before];
      session.onKey(char);
      const next = session.state();

      if (char !== expected) {
        setShakeIndex(before);
        window.setTimeout(() => setShakeIndex(null), 120);
      }

      setState(next);
      onProgress?.(next, session.stats());

      if (next.done) emitFinish();
    },
    [disabled, onProgress, text, emitFinish],
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleKey]);

  useEffect(() => {
    if (autoFocus) containerRef.current?.focus();
  }, [autoFocus]);

  // keep the current character in view on long snippets.
  // biome-ignore lint/correctness/useExhaustiveDependencies: caret drives the scroll
  useEffect(() => {
    currentCharRef.current?.scrollIntoView?.({ block: "nearest" });
  }, [state.caret]);

  const chars = [...text];

  return (
    // biome-ignore lint/a11y/useSemanticElements: a custom typing widget, not a form input
    <div
      ref={containerRef}
      role="textbox"
      tabIndex={0}
      aria-label="Typing area"
      data-target={text}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      className={cn(
        "relative max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border p-6 font-mono text-xl leading-relaxed outline-none transition-colors sm:text-2xl",
        focused
          ? "border-[var(--color-accent)]/60 bg-[var(--color-surface)]"
          : "border-[var(--color-border)] bg-[var(--color-surface)]",
      )}
    >
      {disabled && lockedMessage && !state.done && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--color-bg)]/70 text-sm font-medium text-[var(--color-dim)]">
          {lockedMessage}
        </div>
      )}
      {!disabled && !focused && !state.done && (
        <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-[var(--color-bg)]/60 text-sm text-[var(--color-dim)]">
          Click here and start typing
        </div>
      )}
      {chars.map((char, i) => {
        const cs = state.states[i] ?? "untyped";
        const isCurrent = i === state.caret;
        const showNewline = char === "\n";
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: position is the identity here, chars repeat
            key={`${i}-${char}`}
            ref={isCurrent ? currentCharRef : undefined}
            className={cn("relative", stateClass[cs], shakeIndex === i && "char-shake")}
          >
            {isCurrent && (
              <span
                className={cn(
                  "absolute -left-[1px] top-0 h-full w-[2px] bg-[var(--color-accent)]",
                  focused ? "caret-idle" : "opacity-40",
                )}
                aria-hidden="true"
              />
            )}
            {showNewline ? (
              <>
                <span
                  className={cn(
                    cs === "incorrect" ? "text-[var(--color-bad)]" : "text-[var(--color-muted)]",
                  )}
                >
                  {"↵"}
                </span>
                {"\n"}
              </>
            ) : (
              char
            )}
          </span>
        );
      })}
    </div>
  );
};

export default TypingSurface;
