import { z } from "zod";

export const clientMessageSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("create"), name: z.string().min(1).max(24) }),
  z.object({
    type: z.literal("join"),
    code: z.string().length(4),
    name: z.string().min(1).max(24),
  }),
  z.object({ type: z.literal("ready") }),
  z.object({
    type: z.literal("progress"),
    progress: z.number().min(0).max(100),
    wpm: z.number().min(0),
  }),
  z.object({
    type: z.literal("finish"),
    wpm: z.number().min(0),
    accuracy: z.number().min(0).max(100),
  }),
  z.object({ type: z.literal("leave") }),
]);

export type ClientMessage = z.infer<typeof clientMessageSchema>;

export const playerViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  progress: z.number(),
  wpm: z.number(),
  ready: z.boolean(),
  finished: z.boolean(),
  connected: z.boolean(),
});

export type PlayerView = z.infer<typeof playerViewSchema>;

export const roomViewSchema = z.object({
  code: z.string(),
  snippetId: z.string(),
  status: z.enum(["waiting", "countdown", "racing", "done"]),
  players: z.array(playerViewSchema),
});

export type RoomView = z.infer<typeof roomViewSchema>;

export const raceResultSchema = z.object({
  players: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      wpm: z.number(),
      accuracy: z.number(),
      finished: z.boolean(),
    }),
  ),
  winnerId: z.string().nullable(),
});

export type RaceResult = z.infer<typeof raceResultSchema>;

export const serverMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("created"),
    code: z.string(),
    snippetId: z.string(),
    selfId: z.string(),
  }),
  z.object({
    type: z.literal("joined"),
    code: z.string(),
    snippetId: z.string(),
    selfId: z.string(),
  }),
  z.object({ type: z.literal("state"), room: roomViewSchema }),
  z.object({ type: z.literal("countdown"), seconds: z.number() }),
  z.object({ type: z.literal("start"), startAt: z.number() }),
  z.object({
    type: z.literal("opponentProgress"),
    progress: z.number(),
    wpm: z.number(),
  }),
  z.object({ type: z.literal("done"), results: raceResultSchema }),
  z.object({ type: z.literal("error"), reason: z.string() }),
]);

export type ServerMessage = z.infer<typeof serverMessageSchema>;

// snippet ids the server can assign. these must exist in the frontend catalog.
// both clients look up the text locally by id, so the server never sends text.
export const raceSnippetIds = [
  "js-medium-001",
  "js-medium-002",
  "js-medium-003",
  "py-medium-001",
  "py-medium-002",
  "prose-medium-001",
  "prose-medium-002",
] as const;
