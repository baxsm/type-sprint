import { z } from "zod";
import type { Character } from "./types";
import { characterSchema } from "./types";

// mirror of the ws-server protocol, client side.
// kept in sync manually since the two services do not share a package.

export const playerViewSchema = z.object({
  id: z.string(),
  name: z.string(),
  character: characterSchema,
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

export type ClientMessage =
  | { type: "create"; name: string; character: Character }
  | { type: "join"; code: string; name: string; character: Character }
  | { type: "ready" }
  | { type: "progress"; progress: number; wpm: number }
  | { type: "finish"; wpm: number; accuracy: number }
  | { type: "leave" };

export const errorReasons: Record<string, string> = {
  "room-not-found": "That code did not match a race. Check it and try again.",
  "room-full": "That race is already full.",
  "bad-message": "Something went wrong talking to the server.",
  "already-in-room": "You are already in a race.",
};
