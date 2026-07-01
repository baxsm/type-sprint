"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { DifficultyPicker, LanguagePicker } from "@/components/pickers";
import Button from "@/components/ui/button";
import Panel from "@/components/ui/panel";
import { Label, Subtitle, Title, Value } from "@/components/ui/typography";
import { summarize } from "@/lib/analytics";
import { loadProfile, loadRuns, saveProfile } from "@/lib/storage";
import type { Difficulty, Language } from "@/lib/types";

const modes = [
  {
    href: "/practice",
    title: "Practice",
    desc: "Type at your own pace. Pick a language and difficulty.",
    accent: "var(--color-primary)",
  },
  {
    href: "/daily",
    title: "Daily Challenge",
    desc: "The same snippet for everyone today. Beat your best.",
    accent: "var(--color-correct)",
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
        <Title as="h1" className="text-4xl sm:text-5xl">
          Type faster.
          <span className="text-[var(--color-primary)]"> Prove it.</span>
        </Title>
        <Subtitle className="max-w-xl">
          A typing game for code and prose. Track your speed and accuracy, take the daily challenge,
          and race a friend in real time.
        </Subtitle>
      </section>

      {summary.totalRuns > 0 && (
        <Panel className="flex flex-wrap gap-6 px-5 py-4">
          <StatItem label="Best WPM" value={summary.bestWpm} />
          <StatItem label="Avg WPM" value={summary.avgWpm} />
          <StatItem label="Avg Accuracy" value={`${summary.avgAccuracy}%`} />
          <StatItem label="Runs" value={summary.totalRuns} />
        </Panel>
      )}

      <Panel className="flex flex-col gap-4 p-5">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-wrap gap-6">
            <LanguagePicker value={language} onChange={setLanguage} />
            <DifficultyPicker value={difficulty} onChange={setDifficulty} />
          </div>
          <Button onClick={startPractice} className="shrink-0">
            Start typing
          </Button>
        </div>
      </Panel>

      <section className="grid gap-4 sm:grid-cols-3">
        {modes.map((mode) => (
          <Link key={mode.href} href={mode.href} className="group">
            <Panel className="flex h-full flex-col gap-2 p-5 transition-transform group-hover:-translate-y-0.5">
              <span className="h-1.5 w-10" style={{ backgroundColor: mode.accent }} />
              <Title as="h3" className="text-lg">
                {mode.title}
              </Title>
              <Subtitle className="text-sm">{mode.desc}</Subtitle>
            </Panel>
          </Link>
        ))}
      </section>
    </div>
  );
}

const StatItem = ({ label, value }: { label: string; value: string | number }) => (
  <div className="flex flex-col">
    <Label>{label}</Label>
    <Value className="text-xl">{value}</Value>
  </div>
);
