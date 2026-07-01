"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DifficultyPicker, LanguagePicker } from "@/components/pickers";
import { summarize } from "@/lib/analytics";
import { loadProfile, loadRuns, saveProfile } from "@/lib/storage";
import type { Difficulty, Language } from "@/lib/types";

const modes = [
  {
    href: "/practice",
    title: "Practice",
    desc: "Type at your own pace. Pick a language and difficulty.",
    accent: "var(--color-accent)",
  },
  {
    href: "/daily",
    title: "Daily Challenge",
    desc: "The same snippet for everyone today. Beat your best.",
    accent: "var(--color-good)",
  },
  {
    href: "/race",
    title: "Race",
    desc: "Open a second window and race a friend in real time.",
    accent: "var(--color-opponent)",
  },
];

export default function HomePage() {
  const router = useRouter();
  const [language, setLanguage] = useState<Language>("javascript");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [summary, setSummary] = useState({
    bestWpm: 0,
    avgWpm: 0,
    avgAccuracy: 0,
    totalRuns: 0,
  });

  useEffect(() => {
    const profile = loadProfile();
    setLanguage(profile.lastLanguage);
    setDifficulty(profile.lastDifficulty);
    setSummary(summarize(loadRuns()));
  }, []);

  const startPractice = () => {
    saveProfile({ lastLanguage: language, lastDifficulty: difficulty });
    router.push(`/practice?lang=${language}&diff=${difficulty}`);
  };

  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col gap-3 pt-6">
        <h1 className="font-mono text-4xl font-bold tracking-tight sm:text-5xl">
          Type faster.
          <span className="text-[var(--color-accent)]"> Prove it.</span>
        </h1>
        <p className="max-w-xl text-[var(--color-dim)]">
          A typing game for code and prose. Track your speed and accuracy, take the daily challenge,
          and race a friend in real time.
        </p>
      </section>

      {summary.totalRuns > 0 && (
        <section className="flex flex-wrap gap-6 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-4">
          <StatItem label="Best WPM" value={summary.bestWpm} />
          <StatItem label="Avg WPM" value={summary.avgWpm} />
          <StatItem label="Avg Accuracy" value={`${summary.avgAccuracy}%`} />
          <StatItem label="Runs" value={summary.totalRuns} />
        </section>
      )}

      <section className="flex flex-col gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-6">
            <LanguagePicker value={language} onChange={setLanguage} />
            <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          </div>
          <button
            type="button"
            onClick={startPractice}
            className="shrink-0 rounded-lg bg-[var(--color-accent)] px-6 py-2.5 font-medium text-white transition-opacity hover:opacity-90"
          >
            Start typing
          </button>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {modes.map((mode) => (
          <Link
            key={mode.href}
            href={mode.href}
            className="group flex flex-col gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5 transition-colors hover:border-[var(--color-dim)]"
          >
            <span className="h-1 w-10 rounded-full" style={{ backgroundColor: mode.accent }} />
            <h3 className="text-lg font-semibold">{mode.title}</h3>
            <p className="text-sm text-[var(--color-dim)]">{mode.desc}</p>
          </Link>
        ))}
      </section>
    </div>
  );
}

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-[var(--color-dim)]">{label}</span>
    <span className="font-mono text-xl font-semibold">{value}</span>
  </div>
);
