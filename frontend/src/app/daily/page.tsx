"use client";

import { useEffect, useState } from "react";
import ResultsPanel from "@/components/results-panel";
import StreakBadge from "@/components/streak-badge";
import StreakCalendar from "@/components/streak-calendar";
import TypingHud from "@/components/typing-hud";
import TypingSurface, { type FinishPayload } from "@/components/typing-surface";
import Panel from "@/components/ui/panel";
import { Body, Label, Subtitle, Title, Value } from "@/components/ui/typography";
import { computeStreak } from "@/lib/daily";
import { getDailySnippet, todayStr } from "@/lib/snippets";
import { addRun, loadDailyStore, saveDaily } from "@/lib/storage";
import type { DailyResult, DailyStore, DailyStreak, LiveStats, Snippet } from "@/lib/types";
import { buildRun } from "@/lib/utils";

export default function DailyPage() {
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [dateStr, setDateStr] = useState("");
  const [best, setBest] = useState<DailyResult | null>(null);
  const [store, setStore] = useState<DailyStore>({});
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
    const dailyStore = loadDailyStore();
    setStore(dailyStore);
    setBest(dailyStore[today] ?? null);
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
    setStore(loadDailyStore());
  };

  if (!snippet) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-dim)]">
        Loading today's challenge...
      </div>
    );
  }

  const beatBest = result !== null && best !== null && result.stats.wpm >= best.bestWpm;
  const streak: DailyStreak = computeStreak(store, dateStr);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col">
          <Title as="h1" className="text-2xl">
            Daily Challenge
          </Title>
          <Subtitle className="text-sm">{dateStr} - same snippet for everyone today</Subtitle>
        </div>
        <StreakBadge streak={streak} />
      </div>

      <div className="flex flex-col gap-2">
        <StreakCalendar store={store} today={dateStr} />
        <Body className="text-sm text-[var(--color-dim)]">
          Past days are locked in - everyone gets one honest shot at each day's snippet.
        </Body>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Title as="h2" className="text-lg">
          Today's challenge
        </Title>
        {best && (
          <Panel accent="correct" className="flex flex-col items-end px-4 py-2">
            <Label>Your best today</Label>
            <Value className="text-lg text-[var(--color-correct)]">
              {best.bestWpm} WPM - {best.bestAccuracy}%
            </Value>
          </Panel>
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
              className="border-[2px] px-4 py-3 text-sm"
              style={{
                backgroundColor: beatBest
                  ? "color-mix(in srgb, var(--color-correct) 15%, transparent)"
                  : "var(--color-surface-raised)",
                borderColor: beatBest ? "var(--color-correct)" : "var(--color-border)",
              }}
            >
              {beatBest ? (
                <span className="text-[var(--color-correct)]">New personal best for today.</span>
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
