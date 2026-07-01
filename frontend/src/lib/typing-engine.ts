import { computeAccuracy, computeWpm } from "./stats";
import type { CharState, LiveStats, TypingState } from "./types";

export type TypingSession = {
  onKey: (char: string) => void;
  backspace: () => void;
  state: () => TypingState;
  stats: () => LiveStats;
  wpmSamples: () => number[];
  reset: () => void;
};

// tracks typed characters against a target string.
// timing starts on the first keystroke, not on creation.
export function createTypingSession(target: string): TypingSession {
  const chars = [...target];
  let typed: string[] = [];
  let startedAt: number | null = null;
  let finishedAt: number | null = null;
  let correctCount = 0;
  let totalKeystrokes = 0;
  const samples: number[] = [];

  const now = () => Date.now();

  function elapsed(): number {
    if (startedAt === null) return 0;
    const end = finishedAt ?? now();
    return end - startedAt;
  }

  function sample(): void {
    // record a wpm sample at the current position for consistency
    const e = elapsed();
    if (e > 0) {
      samples.push(computeWpm(typed.length, e));
    }
  }

  function onKey(char: string): void {
    if (finishedAt !== null) return;
    if (typed.length >= chars.length) return;

    if (startedAt === null) startedAt = now();

    const expected = chars[typed.length];
    typed.push(char);
    totalKeystrokes += 1;
    if (char === expected) correctCount += 1;

    sample();

    if (typed.length === chars.length) {
      finishedAt = now();
    }
  }

  function backspace(): void {
    if (finishedAt !== null) return;
    if (typed.length === 0) return;
    typed.pop();
  }

  function state(): TypingState {
    const states: CharState[] = chars.map((c, i) => {
      if (i < typed.length) {
        return typed[i] === c ? "correct" : "incorrect";
      }
      if (i === typed.length) return "current";
      return "untyped";
    });
    return {
      caret: typed.length,
      states,
      done: finishedAt !== null,
    };
  }

  function stats(): LiveStats {
    const e = elapsed();
    const correctSoFar = typed.filter((c, i) => c === chars[i]).length;
    return {
      wpm: computeWpm(correctSoFar, e),
      rawWpm: computeWpm(typed.length, e),
      accuracy: computeAccuracy(correctCount, totalKeystrokes),
      elapsedMs: e,
    };
  }

  function reset(): void {
    typed = [];
    startedAt = null;
    finishedAt = null;
    correctCount = 0;
    totalKeystrokes = 0;
    samples.length = 0;
  }

  return {
    onKey,
    backspace,
    state,
    stats,
    wpmSamples: () => [...samples],
    reset,
  };
}
