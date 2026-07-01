"use client";

import { useEffect, useState } from "react";
import ResultsPanel from "@/components/results-panel";
import TypingHud from "@/components/typing-hud";
import TypingSurface, { type FinishPayload } from "@/components/typing-surface";
import { getDailySnippet, todayStr } from "@/lib/snippets";
import { addRun, loadDaily, saveDaily } from "@/lib/storage";
import type { DailyResult, LiveStats, Snippet } from "@/lib/types";
import { buildRun } from "@/lib/utils";

export default function DailyPage() {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [best, setBest] = useState<DailyResult | null>(null);
  const [result, setResult] = useState<FinishPayload | null>(null);
  const [hud, setHud] = useState<LiveStats>({
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    elapsedMs: 0,
  });
  const [progress, setProgress] = useState(0);
  const [runKey, setRunKey] = useState(0);

  useEffect(() => {
    const today = todayStr();
    setDateStr(today);
    setSnippet(getDailySnippet(today));
    setBest(loadDaily(today));
  }, []);

  const restart = () => {
    setResult(null);
    setProgress(0);
    setHud({ wpm: 0, rawWpm: 0, accuracy: 100, elapsedMs: 0 });
    setRunKey((k) => k + 1);
  };

  const handleFinish = (payload: FinishPayload) => {
    if (!snippet) return;
    setResult(payload);
    setHud(payload.stats);
    setProgress(100);

    addRun(
      buildRun({
        mode: "daily",
        snippet,
        stats: payload.stats,
        consistency: payload.consistency,
        charCount: payload.charCount,
        errorCount: payload.errorCount,
      }),
    );

    const updated = saveDaily({
      date: dateStr,
      snippetId: snippet.id,
      bestWpm: payload.stats.wpm,
      bestAccuracy: payload.stats.accuracy,
      attempts: 1,
      updatedAt: Date.now(),
    });
    setBest(updated);
  };

  if (!snippet) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-dim)]">
        Loading today's challenge...
      </div>
    );
  }

  const beatBest = result !== null && best !== null && result.stats.wpm >= best.bestWpm;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <h1 className="text-2xl font-bold">Daily Challenge</h1>
          <p className="text-sm text-[var(--color-dim)]">
            {dateStr} - same snippet for everyone today
          </p>
        </div>
        {best && (
          <div className="flex flex-col items-end rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2">
            <span className="text-xs uppercase tracking-wide text-[var(--color-dim)]">
              Your best today
            </span>
            <span className="font-mono text-lg font-semibold text-[var(--color-good)]">
              {best.bestWpm} WPM - {best.bestAccuracy}%
            </span>
          </div>
        )}
      </div>

      <TypingHud
        wpm={hud.wpm}
        accuracy={hud.accuracy}
        elapsedMs={hud.elapsedMs}
        progress={progress}
      />

      <TypingSurface
        key={`daily-${runKey}`}
        text={snippet.text}
        disabled={result !== null}
        onProgress={(state, stats) => {
          setHud(stats);
          const total = [...snippet.text].length;
          setProgress(total > 0 ? (state.caret / total) * 100 : 0);
        }}
        onFinish={handleFinish}
      />

      {result && (
        <ResultsPanel
          result={result}
          onRestart={restart}
          extra={
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                backgroundColor: beatBest
                  ? "color-mix(in srgb, var(--color-good) 15%, transparent)"
                  : "var(--color-surface-raised)",
              }}
            >
              {beatBest ? (
                <span className="text-[var(--color-good)]">New personal best for today.</span>
              ) : (
                <span className="text-[var(--color-dim)]">
                  Your best today stays {best?.bestWpm} WPM. Keep trying.
                </span>
              )}
            </div>
          }
        />
      )}
    </div>
  );
}
