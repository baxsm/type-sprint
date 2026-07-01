"use client";

import type { Difficulty, Language } from "@/lib/types";
import { cn } from "@/lib/utils";

const languages: { value: Language; label: string }[] = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "prose", label: "Prose" },
];

const difficulties: { value: Difficulty; label: string }[] = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
];

type PillGroupProps<T extends string> = {
  label: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
};

function PillGroup<T extends string>({ label, options, value, onChange }: PillGroupProps<T>) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-xs uppercase tracking-wide text-[var(--color-dim)]">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={cn(
              "rounded-lg border px-3 py-1.5 text-sm transition-colors",
              value === opt.value
                ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] text-[var(--color-fg)]"
                : "border-[var(--color-border)] text-[var(--color-dim)] hover:border-[var(--color-dim)] hover:text-[var(--color-fg)]",
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export const LanguagePicker = ({
  value,
  onChange,
}: {
  value: Language;
  onChange: (v: Language) => void;
}) => <PillGroup label="Language" options={languages} value={value} onChange={onChange} />;

export const DifficultyPicker = ({
  value,
  onChange,
}: {
  value: Difficulty;
  onChange: (v: Difficulty) => void;
}) => <PillGroup label="Difficulty" options={difficulties} value={value} onChange={onChange} />;
