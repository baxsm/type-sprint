import { z } from "zod";

export const languageSchema = z.enum(["javascript", "python", "prose"]);
export const difficultySchema = z.enum(["easy", "medium", "hard"]);
export const modeSchema = z.enum(["practice", "daily", "race"]);

export type Language = z.infer<typeof languageSchema>;
export type Difficulty = z.infer<typeof difficultySchema>;
export type Mode = z.infer<typeof modeSchema>;

export const snippetSchema = z.object({
  id: z.string(),
  language: languageSchema,
  difficulty: difficultySchema,
  text: z.string(),
  source: z.string().optional(),
});

export type Snippet = z.infer<typeof snippetSchema>;

export const avatarStyleSchema = z.enum([
  "adventurer",
  "bottts",
  "pixel-art",
  "thumbs",
  "notionists",
  "big-smile",
]);

export type AvatarStyle = z.infer<typeof avatarStyleSchema>;

export const characterSchema = z.object({
  style: avatarStyleSchema.default("adventurer"),
  seed: z.string().min(1).max(40),
});

export type Character = z.infer<typeof characterSchema>;

export const profileSchema = z.object({
  name: z.string().min(1).max(24).default("Guest"),
  character: characterSchema.default({ style: "adventurer", seed: "guest" }),
  lastLanguage: languageSchema.default("javascript"),
  lastDifficulty: difficultySchema.default("medium"),
  soundEnabled: z.boolean().default(true),
});

export type Profile = z.infer<typeof profileSchema>;

export const runSchema = z.object({
  id: z.string(),
  finishedAt: z.number(),
  mode: modeSchema,
  language: languageSchema,
  difficulty: difficultySchema,
  snippetId: z.string(),
  wpm: z.number(),
  rawWpm: z.number(),
  accuracy: z.number(),
  consistency: z.number(),
  durationMs: z.number(),
  charCount: z.number(),
  errorCount: z.number(),
});

export type Run = z.infer<typeof runSchema>;

export const dailyResultSchema = z.object({
  date: z.string(),
  snippetId: z.string(),
  bestWpm: z.number(),
  bestAccuracy: z.number(),
  attempts: z.number(),
  updatedAt: z.number(),
});

export type DailyResult = z.infer<typeof dailyResultSchema>;

export const dailyStoreSchema = z.record(z.string(), dailyResultSchema);
export type DailyStore = z.infer<typeof dailyStoreSchema>;

// per-character state on the typing surface
export type CharState = "untyped" | "correct" | "incorrect" | "current";

export type TypingState = {
  caret: number;
  states: CharState[];
  done: boolean;
};

export type LiveStats = {
  wpm: number;
  rawWpm: number;
  accuracy: number;
  elapsedMs: number;
};
