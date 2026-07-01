import type { Language, Run } from "./types";

export type StatsSummary = {
  bestWpm: number;
  avgWpm: number;
  avgAccuracy: number;
  totalRuns: number;
};

export function summarize(runs: Run[]): StatsSummary {
  if (runs.length === 0) {
    return { bestWpm: 0, avgWpm: 0, avgAccuracy: 0, totalRuns: 0 };
  }
  let bestWpm = 0;
  let sumWpm = 0;
  let sumAcc = 0;
  for (const run of runs) {
    if (run.wpm > bestWpm) bestWpm = run.wpm;
    sumWpm += run.wpm;
    sumAcc += run.accuracy;
  }
  return {
    bestWpm,
    avgWpm: Math.round(sumWpm / runs.length),
    avgAccuracy: Math.round((sumAcc / runs.length) * 10) / 10,
    totalRuns: runs.length,
  };
}

export type LanguageStat = {
  language: Language;
  runs: number;
  avgWpm: number;
  bestWpm: number;
};

export function byLanguage(runs: Run[]): LanguageStat[] {
  const groups = new Map<Language, Run[]>();
  for (const run of runs) {
    const list = groups.get(run.language) ?? [];
    list.push(run);
    groups.set(run.language, list);
  }
  const result: LanguageStat[] = [];
  for (const [language, list] of groups) {
    const sumWpm = list.reduce((a, r) => a + r.wpm, 0);
    const bestWpm = list.reduce((m, r) => Math.max(m, r.wpm), 0);
    result.push({
      language,
      runs: list.length,
      avgWpm: Math.round(sumWpm / list.length),
      bestWpm,
    });
  }
  return result.sort((a, b) => b.runs - a.runs);
}

// oldest to newest, for plotting progress over time
export function wpmSeries(runs: Run[], limit = 30): { x: number; wpm: number }[] {
  const sorted = [...runs].sort((a, b) => a.finishedAt - b.finishedAt);
  const sliced = sorted.slice(-limit);
  return sliced.map((run, i) => ({ x: i, wpm: run.wpm }));
}
