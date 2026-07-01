import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Subprocess } from "bun";
import { io, type Socket } from "socket.io-client";
import type { ServerMessage } from "../protocol";

// boots the real server as a subprocess and drives it with a real socket.io
// client. this catches wiring bugs that pure unit tests on the manager cannot.

const PORT = 3999;
const URL = `http://localhost:${PORT}`;
let proc: Subprocess;

async function waitForHealth(retries = 40): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`${URL}/health`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await Bun.sleep(50);
  }
  throw new Error("server did not start");
}

function connect(): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(URL, { transports: ["websocket"] });
    socket.on("connect", () => resolve(socket));
    socket.on("connect_error", (err) => reject(err));
  });
}

// waits until a message of the given type arrives, returns it
function nextMessage<T extends ServerMessage["type"]>(
  socket: Socket,
  type: T,
  timeoutMs = 2000,
): Promise<Extract<ServerMessage, { type: T }>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off("message", handler);
      reject(new Error(`timed out waiting for ${type}`));
    }, timeoutMs);
    const handler = (msg: ServerMessage) => {
      if (msg.type === type) {
        clearTimeout(timer);
        socket.off("message", handler);
        resolve(msg as Extract<ServerMessage, { type: T }>);
      }
    };
    socket.on("message", handler);
  });
}

function send(socket: Socket, msg: unknown): void {
  socket.emit("message", msg);
}

beforeAll(async () => {
  proc = Bun.spawn(["bun", "run", "src/index.ts"], {
    env: { ...process.env, PORT: String(PORT) },
    stdout: "ignore",
    stderr: "ignore",
  });
  await waitForHealth();
});

afterAll(() => {
  proc?.kill();
});

describe("ws-server integration", () => {
  it("runs a full two-player race to completion", async () => {
    const a = await connect();
    const b = await connect();

    // collect every state broadcast a receives, since create/join/ready each
    // trigger one and nextMessage only looks forward from when it's called
    const statesForA: Extract<ServerMessage, { type: "state" }>[] = [];
    a.on("message", (msg: ServerMessage) => {
      if (msg.type === "state") statesForA.push(msg);
    });

    send(a, {
      type: "create",
      name: "Alice",
      character: { style: "adventurer", seed: "alice" },
    });
    const created = await nextMessage(a, "created");
    expect(created.code.length).toBe(4);

    send(b, {
      type: "join",
      code: created.code,
      name: "Bob",
      character: { style: "bottts", seed: "bob" },
    });
    const joined = await nextMessage(b, "joined");
    expect(joined.snippetId).toBe(created.snippetId);

    // the state broadcast after joining should carry both players' characters
    const stateAfterJoin = statesForA.find((s) => s.room.players.some((p) => p.name === "Bob"));
    const bobInState = stateAfterJoin?.room.players.find((p) => p.name === "Bob");
    expect(bobInState?.character).toEqual({ style: "bottts", seed: "bob" });

    send(a, { type: "ready" });
    send(b, { type: "ready" });

    // both should get a start (after a ~3s countdown)
    await nextMessage(a, "start", 6000);
    await nextMessage(b, "start", 6000);

    // a sends progress, b should see it as opponentProgress
    send(a, { type: "progress", progress: 50, wpm: 60 });
    const opp = await nextMessage(b, "opponentProgress");
    expect(opp.progress).toBe(50);

    send(a, { type: "finish", wpm: 88, accuracy: 99 });
    send(b, { type: "finish", wpm: 60, accuracy: 90 });

    const done = await nextMessage(a, "done");
    expect(done.results.winnerId).toBeTruthy();
    expect(done.results.players.length).toBe(2);

    a.disconnect();
    b.disconnect();
  });

  it("handles a mid-race disconnect and lets the other finish", async () => {
    const a = await connect();
    const b = await connect();

    send(a, {
      type: "create",
      name: "Alice",
      character: { style: "adventurer", seed: "alice" },
    });
    const created = await nextMessage(a, "created");
    send(b, {
      type: "join",
      code: created.code,
      name: "Bob",
      character: { style: "bottts", seed: "bob" },
    });
    await nextMessage(b, "joined");

    send(a, { type: "ready" });
    send(b, { type: "ready" });
    await nextMessage(a, "start", 5000);

    // b drops out
    b.disconnect();

    send(a, { type: "finish", wpm: 75, accuracy: 96 });
    const done = await nextMessage(a, "done", 3000);
    expect(done.results.winnerId).toBeTruthy();

    a.disconnect();
  });

  it("stays up when sent a message that fails schema validation", async () => {
    const a = await connect();
    send(a, { type: "not-a-real-message-type", garbage: true });
    const err = await nextMessage(a, "error");
    expect(err.reason).toBe("bad-message");

    // connection still usable afterwards
    send(a, {
      type: "create",
      name: "Alice",
      character: { style: "adventurer", seed: "alice" },
    });
    const created = await nextMessage(a, "created");
    expect(created.code.length).toBe(4);

    a.disconnect();
  });
});
