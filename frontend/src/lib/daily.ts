import type { DailyStore, DailyStreak } from "./types";

export function addDays(dateStr: string, delta: number): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(y as number, (m as number) - 1, d as number);
  date.setDate(date.getDate() + delta);
  const yy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yy}-${mm}-${dd}`;
}

export function computeStreak(store: DailyStore, today: string): DailyStreak {
  const playedDates = Object.keys(store).sort();

  let current = 0;
  let cursor = today;
  while (store[cursor]) {
    current += 1;
    cursor = addDays(cursor, -1);
  }

  let longest = 0;
  let run = 0;
  let prevDate: string | null = null;
  for (const date of playedDates) {
    if (prevDate !== null && addDays(prevDate, 1) === date) {
      run += 1;
    } else {
      run = 1;
    }
    longest = Math.max(longest, run);
    prevDate = date;
  }

  return { current, longest: Math.max(longest, current), playedDates };
}
