import { z } from "zod";
import {
  type DailyResult,
  dailyResultSchema,
  dailyStoreSchema,
  type Profile,
  profileSchema,
  type Run,
  runSchema,
} from "./types";

const KEYS = {
  profile: "type-sprint:profile",
  runs: "type-sprint:runs",
  daily: "type-sprint:daily",
} as const;

const MAX_RUNS = 200;

function hasStorage(): boolean {
  try {
    return typeof window !== "undefined" && !!window.localStorage;
  } catch {
    return false;
  }
}

function readJson(key: string): unknown {
  if (!hasStorage()) return null;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown): void {
  if (!hasStorage()) return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable (private mode). fail quietly.
  }
}

export function loadProfile(): Profile {
  const parsed = profileSchema.safeParse(readJson(KEYS.profile));
  if (parsed.success) return parsed.data;
  return profileSchema.parse({});
}

export function saveProfile(patch: Partial<Profile>): Profile {
  const current = loadProfile();
  const next = { ...current, ...patch };
  const validated = profileSchema.safeParse(next);
  const toSave = validated.success ? validated.data : current;
  writeJson(KEYS.profile, toSave);
  return toSave;
}

export function loadRuns(): Run[] {
  const parsed = z.array(runSchema).safeParse(readJson(KEYS.runs));
  if (parsed.success) return parsed.data;
  return [];
}

export function addRun(run: Run): void {
  const validated = runSchema.safeParse(run);
  if (!validated.success) return;
  const runs = loadRuns();
  runs.unshift(validated.data);
  if (runs.length > MAX_RUNS) runs.length = MAX_RUNS;
  writeJson(KEYS.runs, runs);
}

export function clearRuns(): void {
  writeJson(KEYS.runs, []);
}

function loadDailyStore(): Record<string, DailyResult> {
  const parsed = dailyStoreSchema.safeParse(readJson(KEYS.daily));
  if (parsed.success) return parsed.data;
  return {};
}

export function loadDaily(dateStr: string): DailyResult | null {
  const store = loadDailyStore();
  return store[dateStr] ?? null;
}

// saves only when the new result beats the stored best for that date.
// always bumps the attempts counter.
export function saveDaily(result: DailyResult): DailyResult {
  const validated = dailyResultSchema.safeParse(result);
  if (!validated.success) return result;
  const incoming = validated.data;

  const store = loadDailyStore();
  const existing = store[incoming.date];

  if (!existing) {
    store[incoming.date] = { ...incoming, attempts: 1 };
    writeJson(KEYS.daily, store);
    return store[incoming.date] as DailyResult;
  }

  const merged: DailyResult = {
    ...existing,
    bestWpm: Math.max(existing.bestWpm, incoming.bestWpm),
    bestAccuracy: Math.max(existing.bestAccuracy, incoming.bestAccuracy),
    attempts: existing.attempts + 1,
    updatedAt: incoming.updatedAt,
  };
  store[incoming.date] = merged;
  writeJson(KEYS.daily, store);
  return merged;
}
