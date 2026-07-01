import type { LiveStats, Mode, Run, Snippet } from "./types";

// merge class names, filtering falsy values. no external dep needed.
export function cn(...classes: Array<string | false | null | undefined>): string {
  return classes.filter(Boolean).join(" ");
}

export function generateId(): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `${Date.now().toString(36)}-${rand}`;
}

export function formatDate(ms: number): string {
  const d = new Date(ms);
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// assemble a run record from a finished session's stats
export function buildRun(params: {
  mode: Mode;
  snippet: Snippet;
  stats: LiveStats;
  consistency: number;
  charCount: number;
  errorCount: number;
}): Run {
  const { mode, snippet, stats, consistency, charCount, errorCount } = params;
  return {
    id: generateId(),
    finishedAt: Date.now(),
    mode,
    language: snippet.language,
    difficulty: snippet.difficulty,
    snippetId: snippet.id,
    wpm: stats.wpm,
    rawWpm: stats.rawWpm,
    accuracy: stats.accuracy,
    consistency,
    durationMs: stats.elapsedMs,
    charCount,
    errorCount,
  };
}
