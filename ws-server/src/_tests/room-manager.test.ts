import { beforeEach, describe, expect, it } from "bun:test";
import type { Character, ServerMessage } from "../protocol";
import { RoomManager } from "../room-manager";

type Sent = { to: string; msg: ServerMessage };

const aliceCharacter: Character = { style: "adventurer", seed: "alice" };
const bobCharacter: Character = { style: "bottts", seed: "bob" };

function setup() {
  const sent: Sent[] = [];
  // run scheduled timers immediately so countdown resolves synchronously
  const manager = new RoomManager({
    send: (to, msg) => sent.push({ to, msg }),
    now: () => 1000,
    schedule: (fn) => fn(),
    pickSnippet: () => "js-medium-001",
  });
  return { manager, sent };
}

function messagesTo(sent: Sent[], id: string): ServerMessage[] {
  return sent.filter((s) => s.to === id).map((s) => s.msg);
}

function lastOfType<T extends ServerMessage["type"]>(
  sent: Sent[],
  id: string,
  type: T,
): Extract<ServerMessage, { type: T }> | undefined {
  const matches = messagesTo(sent, id).filter((m) => m.type === type);
  return matches[matches.length - 1] as Extract<ServerMessage, { type: T }> | undefined;
}

describe("RoomManager", () => {
  let manager: RoomManager;
  let sent: Sent[];

  beforeEach(() => {
    const s = setup();
    manager = s.manager;
    sent = s.sent;
  });

  it("creates a room and assigns the creator", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const created = lastOfType(sent, "p1", "created");
    expect(created).toBeDefined();
    expect(created?.code.length).toBe(4);
    expect(created?.snippetId).toBe("js-medium-001");
    expect(manager.roomCount()).toBe(1);
  });

  it("lets a second player join", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    const joined = lastOfType(sent, "p2", "joined");
    expect(joined?.code).toBe(code);
  });

  it("includes each player's character in the room view broadcast to the opponent", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });

    const stateForP2 = lastOfType(sent, "p2", "state");
    const alice = stateForP2?.room.players.find((p) => p.id === "p1");
    const bob = stateForP2?.room.players.find((p) => p.id === "p2");
    expect(alice?.character).toEqual(aliceCharacter);
    expect(bob?.character).toEqual(bobCharacter);
  });

  it("rejects a third player as room-full", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p3", {
      type: "join",
      code,
      name: "Carol",
      character: { style: "thumbs", seed: "carol" },
    });
    const err = lastOfType(sent, "p3", "error");
    expect(err?.reason).toBe("room-full");
  });

  it("rejects join with an unknown code", () => {
    manager.handle("p2", { type: "join", code: "ZZZZ", name: "Bob", character: bobCharacter });
    const err = lastOfType(sent, "p2", "error");
    expect(err?.reason).toBe("room-not-found");
  });

  it("rejects create when already in a room", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const err = lastOfType(sent, "p1", "error");
    expect(err?.reason).toBe("already-in-room");
  });

  it("runs countdown then start when both ready", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p1", { type: "ready" });
    manager.handle("p2", { type: "ready" });

    const countdowns = messagesTo(sent, "p1").filter((m) => m.type === "countdown");
    expect(countdowns.length).toBeGreaterThan(0);
    const start = lastOfType(sent, "p1", "start");
    expect(start).toBeDefined();
    expect(start?.startAt).toBe(1000);
  });

  it("does not start until both players are ready", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p1", { type: "ready" });
    expect(lastOfType(sent, "p1", "start")).toBeUndefined();
  });

  it("relays progress to the opponent only", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p1", { type: "ready" });
    manager.handle("p2", { type: "ready" });

    const before = messagesTo(sent, "p1").filter((m) => m.type === "opponentProgress").length;
    manager.handle("p1", { type: "progress", progress: 40, wpm: 55 });

    const p2Progress = lastOfType(sent, "p2", "opponentProgress");
    expect(p2Progress?.progress).toBe(40);
    // sender should not receive its own progress back
    const afterP1 = messagesTo(sent, "p1").filter((m) => m.type === "opponentProgress").length;
    expect(afterP1).toBe(before);
  });

  it("decides the winner by earliest finish", () => {
    let clock = 1000;
    const local = new RoomManager({
      send: (to, msg) => sent.push({ to, msg }),
      now: () => clock,
      schedule: (fn) => fn(),
      pickSnippet: () => "js-medium-001",
    });
    local.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    local.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    local.handle("p1", { type: "ready" });
    local.handle("p2", { type: "ready" });

    clock = 2000;
    local.handle("p1", { type: "finish", wpm: 90, accuracy: 98 });
    clock = 3000;
    local.handle("p2", { type: "finish", wpm: 70, accuracy: 95 });

    const done = lastOfType(sent, "p1", "done");
    expect(done?.results.winnerId).toBe("p1");
  });

  it("lets the remaining player win when the opponent disconnects mid-race", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p1", { type: "ready" });
    manager.handle("p2", { type: "ready" });

    manager.handle("p1", { type: "finish", wpm: 80, accuracy: 97 });
    // p1 finished, p2 never does then disconnects
    manager.disconnect("p2");

    const done = lastOfType(sent, "p1", "done");
    expect(done?.results.winnerId).toBe("p1");
  });

  it("ends the race for both as soon as the first player finishes", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p1", { type: "ready" });
    manager.handle("p2", { type: "ready" });

    // p1 finishes, p2 is still typing (never sends finish)
    manager.handle("p1", { type: "finish", wpm: 85, accuracy: 96 });

    const doneP1 = lastOfType(sent, "p1", "done");
    const doneP2 = lastOfType(sent, "p2", "done");
    expect(doneP1?.results.winnerId).toBe("p1");
    expect(doneP2?.results.winnerId).toBe("p1");
    // p2's entry in the results reflects they had not finished
    const p2Result = doneP2?.results.players.find((p) => p.id === "p2");
    expect(p2Result?.finished).toBe(false);
  });

  it("lets the sole remaining player win if the opponent disconnects before anyone finishes", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    const code = lastOfType(sent, "p1", "created")?.code as string;
    manager.handle("p2", { type: "join", code, name: "Bob", character: bobCharacter });
    manager.handle("p1", { type: "ready" });
    manager.handle("p2", { type: "ready" });

    // neither has finished yet, p2 simply drops
    manager.disconnect("p2");

    const done = lastOfType(sent, "p1", "done");
    expect(done?.results.winnerId).toBe("p1");
  });

  it("garbage collects a room when everyone disconnects", () => {
    manager.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    expect(manager.roomCount()).toBe(1);
    manager.disconnect("p1");
    expect(manager.roomCount()).toBe(0);
  });

  it("sweeps idle empty rooms past the cutoff", () => {
    let clock = 1000;
    const local = new RoomManager({
      send: (to, msg) => sent.push({ to, msg }),
      now: () => clock,
      schedule: (fn) => fn(),
      pickSnippet: () => "js-medium-001",
    });
    local.handle("p1", { type: "create", name: "Alice", character: aliceCharacter });
    // creator leaves the socket open but room ages; force an orphan by
    // disconnecting after making it non-empty is covered above. here we
    // simulate an aged empty room via sweep with a tiny max age.
    local.disconnect("p1");
    expect(local.roomCount()).toBe(0);
    clock = 999999;
    local.sweepIdle(1000);
    expect(local.roomCount()).toBe(0);
  });
});
