import {
  type ClientMessage,
  type RaceResult,
  type RoomView,
  raceSnippetIds,
  type ServerMessage,
} from "./protocol";

type Player = {
  id: string;
  name: string;
  progress: number;
  wpm: number;
  accuracy: number;
  ready: boolean;
  finished: boolean;
  finishedAt: number | null;
  connected: boolean;
};

type Room = {
  code: string;
  snippetId: string;
  status: "waiting" | "countdown" | "racing" | "done";
  players: Map<string, Player>;
  createdAt: number;
};

// the manager owns all room state and pushes messages out via `send`.
// it never touches sockets directly, which makes it fully unit-testable.
export type SendFn = (playerId: string, message: ServerMessage) => void;

const COUNTDOWN_SECONDS = 3;
const MAX_PLAYERS = 2;

export class RoomManager {
  private rooms = new Map<string, Room>();
  private playerRoom = new Map<string, string>();
  private send: SendFn;
  private now: () => number;
  private schedule: (fn: () => void, ms: number) => void;
  private pickSnippet: () => string;

  constructor(opts: {
    send: SendFn;
    now?: () => number;
    // injectable so tests can run timers synchronously
    schedule?: (fn: () => void, ms: number) => void;
    pickSnippet?: () => string;
  }) {
    this.send = opts.send;
    this.now = opts.now ?? (() => Date.now());
    this.schedule = opts.schedule ?? ((fn, ms) => setTimeout(fn, ms));
    this.pickSnippet =
      opts.pickSnippet ??
      (() => {
        const i = Math.floor(Math.random() * raceSnippetIds.length);
        return raceSnippetIds[i] as string;
      });
  }

  handle(playerId: string, message: ClientMessage): void {
    switch (message.type) {
      case "create":
        this.create(playerId, message.name);
        break;
      case "join":
        this.join(playerId, message.code, message.name);
        break;
      case "ready":
        this.ready(playerId);
        break;
      case "progress":
        this.progress(playerId, message.progress, message.wpm);
        break;
      case "finish":
        this.finish(playerId, message.wpm, message.accuracy);
        break;
      case "leave":
        this.leave(playerId);
        break;
    }
  }

  private generateCode(): string {
    const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    for (let attempt = 0; attempt < 50; attempt++) {
      let code = "";
      for (let i = 0; i < 4; i++) {
        code += alphabet[Math.floor(Math.random() * alphabet.length)];
      }
      if (!this.rooms.has(code)) return code;
    }
    // extreme fallback, effectively never hit
    return `R${this.rooms.size}`.padEnd(4, "0").slice(0, 4);
  }

  private newPlayer(id: string, name: string): Player {
    return {
      id,
      name,
      progress: 0,
      wpm: 0,
      accuracy: 0,
      ready: false,
      finished: false,
      finishedAt: null,
      connected: true,
    };
  }

  private create(playerId: string, name: string): void {
    if (this.playerRoom.has(playerId)) {
      this.send(playerId, { type: "error", reason: "already-in-room" });
      return;
    }
    const code = this.generateCode();
    const snippetId = this.pickSnippet();
    const room: Room = {
      code,
      snippetId,
      status: "waiting",
      players: new Map(),
      createdAt: this.now(),
    };
    room.players.set(playerId, this.newPlayer(playerId, name));
    this.rooms.set(code, room);
    this.playerRoom.set(playerId, code);

    this.send(playerId, { type: "created", code, snippetId, selfId: playerId });
    this.broadcastState(room);
  }

  private join(playerId: string, code: string, name: string): void {
    if (this.playerRoom.has(playerId)) {
      this.send(playerId, { type: "error", reason: "already-in-room" });
      return;
    }
    const room = this.rooms.get(code.toUpperCase());
    if (!room) {
      this.send(playerId, { type: "error", reason: "room-not-found" });
      return;
    }
    if (room.players.size >= MAX_PLAYERS) {
      this.send(playerId, { type: "error", reason: "room-full" });
      return;
    }
    room.players.set(playerId, this.newPlayer(playerId, name));
    this.playerRoom.set(playerId, room.code);

    this.send(playerId, {
      type: "joined",
      code: room.code,
      snippetId: room.snippetId,
      selfId: playerId,
    });
    this.broadcastState(room);
  }

  private ready(playerId: string): void {
    const room = this.roomOf(playerId);
    if (!room) return;
    const player = room.players.get(playerId);
    if (!player) return;
    player.ready = true;
    this.broadcastState(room);

    const connected = [...room.players.values()].filter((p) => p.connected);
    const allReady = connected.length === MAX_PLAYERS && connected.every((p) => p.ready);

    if (allReady && room.status === "waiting") {
      this.startCountdown(room);
    }
  }

  private startCountdown(room: Room): void {
    room.status = "countdown";
    this.broadcastState(room);

    let remaining = COUNTDOWN_SECONDS;
    const tick = () => {
      if (room.status !== "countdown") return;
      if (remaining > 0) {
        this.broadcastToRoom(room, { type: "countdown", seconds: remaining });
        remaining -= 1;
        this.schedule(tick, 1000);
      } else {
        room.status = "racing";
        const startAt = this.now();
        this.broadcastToRoom(room, { type: "start", startAt });
        this.broadcastState(room);
      }
    };
    tick();
  }

  private progress(playerId: string, progress: number, wpm: number): void {
    const room = this.roomOf(playerId);
    if (room?.status !== "racing") return;
    const player = room.players.get(playerId);
    if (!player) return;
    player.progress = progress;
    player.wpm = wpm;

    // relay to the opponent only, not back to the sender
    for (const other of room.players.values()) {
      if (other.id !== playerId && other.connected) {
        this.send(other.id, { type: "opponentProgress", progress, wpm });
      }
    }
  }

  private finish(playerId: string, wpm: number, accuracy: number): void {
    const room = this.roomOf(playerId);
    if (!room) return;
    const player = room.players.get(playerId);
    if (!player) return;
    player.finished = true;
    player.finishedAt = this.now();
    player.wpm = wpm;
    player.accuracy = accuracy;
    player.progress = 100;
    this.broadcastState(room);

    this.maybeFinishRace(room);
  }

  // the race ends the moment any connected player finishes. that player wins.
  // the other player sees the race is over even if they were still typing.
  private maybeFinishRace(room: Room): void {
    const active = [...room.players.values()].filter((p) => p.connected);
    const anyFinished = active.some((p) => p.finished);
    if (!anyFinished) return;
    this.completeRace(room);
  }

  private completeRace(room: Room): void {
    if (room.status === "done") return;
    room.status = "done";

    const players = [...room.players.values()];
    // winner is the finisher with the earliest finish time.
    // a connected finisher always beats a disconnected non-finisher.
    const finishers = players
      .filter((p) => p.finished && p.finishedAt !== null)
      .sort((a, b) => (a.finishedAt ?? 0) - (b.finishedAt ?? 0));

    const winnerId = finishers[0]?.id ?? null;

    const results: RaceResult = {
      players: players.map((p) => ({
        id: p.id,
        name: p.name,
        wpm: p.wpm,
        accuracy: p.accuracy,
        finished: p.finished,
      })),
      winnerId,
    };

    this.broadcastToRoom(room, { type: "done", results });
  }

  disconnect(playerId: string): void {
    const room = this.roomOf(playerId);
    this.playerRoom.delete(playerId);
    if (!room) return;

    const player = room.players.get(playerId);
    if (player) player.connected = false;

    const anyConnected = [...room.players.values()].some((p) => p.connected);
    if (!anyConnected) {
      this.rooms.delete(room.code);
      return;
    }

    this.broadcastState(room);

    // if the race was on and only one player remains, they win by default,
    // whether or not anyone had already finished
    if (room.status === "racing" || room.status === "countdown") {
      const remaining = [...room.players.values()].filter((p) => p.connected);
      if (remaining.length === 1) {
        const [survivor] = remaining;
        if (survivor && !survivor.finished) {
          survivor.finished = true;
          survivor.finishedAt = this.now();
        }
      }
      this.maybeFinishRace(room);
    }
  }

  private leave(playerId: string): void {
    this.disconnect(playerId);
  }

  private roomOf(playerId: string): Room | undefined {
    const code = this.playerRoom.get(playerId);
    if (!code) return undefined;
    return this.rooms.get(code);
  }

  private toView(room: Room): RoomView {
    return {
      code: room.code,
      snippetId: room.snippetId,
      status: room.status,
      players: [...room.players.values()].map((p) => ({
        id: p.id,
        name: p.name,
        progress: p.progress,
        wpm: p.wpm,
        ready: p.ready,
        finished: p.finished,
        connected: p.connected,
      })),
    };
  }

  private broadcastState(room: Room): void {
    this.broadcastToRoom(room, { type: "state", room: this.toView(room) });
  }

  private broadcastToRoom(room: Room, message: ServerMessage): void {
    for (const player of room.players.values()) {
      if (player.connected) this.send(player.id, message);
    }
  }

  // used by the idle sweeper and tests
  roomCount(): number {
    return this.rooms.size;
  }

  sweepIdle(maxAgeMs: number): void {
    const cutoff = this.now() - maxAgeMs;
    for (const [code, room] of this.rooms) {
      const anyConnected = [...room.players.values()].some((p) => p.connected);
      if (!anyConnected && room.createdAt < cutoff) {
        this.rooms.delete(code);
      }
    }
  }
}
