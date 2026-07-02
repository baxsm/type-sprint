"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { DifficultyPicker, LanguagePicker } from "@/components/pickers";
import ResultsPanel from "@/components/results-panel";
import TypingHud from "@/components/typing-hud";
import TypingSurface, { type FinishPayload } from "@/components/typing-surface";
import { getSnippet } from "@/lib/snippets";
import { addRun, loadProfile, saveProfile } from "@/lib/storage";
import type { Difficulty, Language, LiveStats, Snippet } from "@/lib/types";
import { difficultySchema, languageSchema } from "@/lib/types";
import { buildRun } from "@/lib/utils";

function PracticeInner() {
  const params = useSearchParams();
  const [language, setLanguage] = useState<Language>("javascript");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [result, setResult] = useState<FinishPayload | null>(null);
  const [hud, setHud] = useState<LiveStats>({
    wpm: 0,
    rawWpm: 0,
    accuracy: 100,
    elapsedMs: 0,
  });
  const [progress, setProgress] = useState(0);
  const [runKey, setRunKey] = useState(0);

  // initial language/difficulty from url or profile
  useEffect(() => {
    const profile = loadProfile();
    const langParam = languageSchema.safeParse(params.get("lang"));
    const diffParam = difficultySchema.safeParse(params.get("diff"));
    const lang = langParam.success ? langParam.data : profile.lastLanguage;
    const diff = diffParam.success ? diffParam.data : profile.lastDifficulty;
    setLanguage(lang);
    setDifficulty(diff);
    setSnippet(getSnippet(lang, diff));
  }, [params]);

  const loadNew = useCallback((lang: Language, diff: Difficulty) => {
    setSnippet((prev) => getSnippet(lang, diff, prev?.id));
    setResult(null);
    setProgress(0);
    setHud({ wpm: 0, rawWpm: 0, accuracy: 100, elapsedMs: 0 });
    setRunKey((k) => k + 1);
  }, []);

  const changeLanguage = (lang: Language) => {
    setLanguage(lang);
    saveProfile({ lastLanguage: lang });
    loadNew(lang, difficulty);
  };

  const changeDifficulty = (diff: Difficulty) => {
    setDifficulty(diff);
    saveProfile({ lastDifficulty: diff });
    loadNew(language, diff);
  };

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
        mode: "practice",
        snippet,
        stats: payload.stats,
        consistency: payload.consistency,
        charCount: payload.charCount,
        errorCount: payload.errorCount,
      }),
    );
  };

  if (!snippet) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-dim)]">
        Loading snippet...
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap gap-6">
          <LanguagePicker value={language} onChange={changeLanguage} />
          <DifficultyPicker value={difficulty} onChange={changeDifficulty} />
        </div>
      </div>

      <TypingHud
        wpm={hud.wpm}
        accuracy={hud.accuracy}
        elapsedMs={hud.elapsedMs}
        progress={progress}
      />

      <TypingSurface
        key={`${snippet.id}-${runKey}`}
        text={snippet.text}
        disabled={result !== null}
        onProgress={(state, stats) => {
          setHud(stats);
          const total = [...snippet.text].length;
          setProgress(total > 0 ? (state.caret / total) * 100 : 0);
        }}
        onFinish={handleFinish}
      />

      {result ? (
        <ResultsPanel
          result={result}
          onRestart={restart}
          onNext={() => loadNew(language, difficulty)}
        />
      ) : (
        <div className="flex gap-3">
          <button
            type="button"
            onClick={restart}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-dim)] transition-colors hover:border-[var(--color-dim)] hover:text-[var(--color-fg)]"
          >
            Restart
          </button>
          <button
            type="button"
            onClick={() => loadNew(language, difficulty)}
            className="rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-dim)] transition-colors hover:border-[var(--color-dim)] hover:text-[var(--color-fg)]"
          >
            New snippet
          </button>
        </div>
      )}
    </div>
  );
}

export default function PracticePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-64 items-center justify-center text-[var(--color-dim)]">
          Loading...
        </div>
      }
    >
      <PracticeInner />
    </Suspense>
  );
}
