import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import type { Subprocess } from "bun";
import type { ServerMessage } from "../protocol";

// boots the real server as a subprocess and drives it with real websockets.
// this catches wiring bugs that pure unit tests on the manager cannot.

const PORT = 3999;
const URL = `ws://localhost:${PORT}`;
let proc: Subprocess;

async function waitForHealth(retries = 40): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(`http://localhost:${PORT}/health`);
      if (res.ok) return;
    } catch {
      // not up yet
    }
    await Bun.sleep(50);
  }
  throw new Error("server did not start");
}

function connect(): Promise<WebSocket> {
  return new Promise((resolve, reject) => {
    const ws = new WebSocket(URL);
    ws.onopen = () => resolve(ws);
    ws.onerror = (e) => reject(e);
  });
}

// waits until a message of the given type arrives, returns it
function nextMessage<T extends ServerMessage["type"]>(
  ws: WebSocket,
  type: T,
  timeoutMs = 2000,
): Promise<Extract<ServerMessage, { type: T }>> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      ws.removeEventListener("message", handler);
      reject(new Error(`timed out waiting for ${type}`));
    }, timeoutMs);
    const handler = (event: MessageEvent) => {
      const msg = JSON.parse(event.data as string) as ServerMessage;
      if (msg.type === type) {
        clearTimeout(timer);
        ws.removeEventListener("message", handler);
        resolve(msg as Extract<ServerMessage, { type: T }>);
      }
    };
    ws.addEventListener("message", handler);
  });
}

function send(ws: WebSocket, msg: unknown): void {
  ws.send(JSON.stringify(msg));
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

    send(a, { type: "create", name: "Alice" });
    const created = await nextMessage(a, "created");
    expect(created.code.length).toBe(4);

    send(b, { type: "join", code: created.code, name: "Bob" });
    const joined = await nextMessage(b, "joined");
    expect(joined.snippetId).toBe(created.snippetId);

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

    a.close();
    b.close();
  });

  it("handles a mid-race disconnect and lets the other finish", async () => {
    const a = await connect();
    const b = await connect();

    send(a, { type: "create", name: "Alice" });
    const created = await nextMessage(a, "created");
    send(b, { type: "join", code: created.code, name: "Bob" });
    await nextMessage(b, "joined");

    send(a, { type: "ready" });
    send(b, { type: "ready" });
    await nextMessage(a, "start", 5000);

    // b drops out
    b.close();

    send(a, { type: "finish", wpm: 75, accuracy: 96 });
    const done = await nextMessage(a, "done", 3000);
    expect(done.results.winnerId).toBeTruthy();

    a.close();
  });

  it("stays up when sent a malformed frame", async () => {
    const a = await connect();
    a.send("this is not json");
    const err = await nextMessage(a, "error");
    expect(err.reason).toBe("bad-message");

    // connection still usable afterwards
    send(a, { type: "create", name: "Alice" });
    const created = await nextMessage(a, "created");
    expect(created.code.length).toBe(4);

    a.close();
  });
});
