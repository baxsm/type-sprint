import { snippets } from "@/data/snippets";
import type { Difficulty, Language, Snippet } from "./types";

export function getSnippetById(id: string): Snippet | null {
  return snippets.find((s) => s.id === id) ?? null;
}

export function getSnippetsFor(language: Language, difficulty: Difficulty): Snippet[] {
  return snippets.filter((s) => s.language === language && s.difficulty === difficulty);
}

export function getSnippet(
  language: Language,
  difficulty: Difficulty,
  excludeId?: string,
): Snippet {
  const pool = getSnippetsFor(language, difficulty);
  if (pool.length === 0) {
    // fall back to any snippet in the language so the app never dead-ends
    const byLang = snippets.filter((s) => s.language === language);
    const fallback = byLang[0] ?? snippets[0];
    // snippets is a non-empty static catalog, so fallback is always defined
    return fallback as Snippet;
  }
  const candidates = excludeId && pool.length > 1 ? pool.filter((s) => s.id !== excludeId) : pool;
  const index = Math.floor(Math.random() * candidates.length);
  return candidates[index] as Snippet;
}

// deterministic hash so a given date always maps to the same snippet
function hashString(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

// same date yields the same snippet for everyone. no backend needed.
export function getDailySnippet(dateStr: string): Snippet {
  // daily pulls from medium difficulty across all languages for a fair mix
  const pool = snippets.filter((s) => s.difficulty === "medium");
  const source = pool.length > 0 ? pool : snippets;
  const index = hashString(dateStr) % source.length;
  return source[index] as Snippet;
}

// local date as YYYY-MM-DD, not utc, so the daily flips at local midnight
export function todayStr(date = new Date()): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
