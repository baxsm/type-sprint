import type { ServerWebSocket } from "bun";
import { clientMessageSchema, type ServerMessage } from "./protocol";
import { RoomManager } from "./room-manager";

type SocketData = { id: string };

const port = Number(process.env.PORT ?? 3001);

const sockets = new Map<string, ServerWebSocket<SocketData>>();

const manager = new RoomManager({
  send: (playerId, message) => {
    const ws = sockets.get(playerId);
    if (ws && ws.readyState === 1) {
      ws.send(JSON.stringify(message));
    }
  },
});

function nextId(): string {
  return `p_${Math.random().toString(36).slice(2, 10)}`;
}

function sendError(ws: ServerWebSocket<SocketData>, reason: string): void {
  const msg: ServerMessage = { type: "error", reason };
  ws.send(JSON.stringify(msg));
}

const server = Bun.serve<SocketData, never>({
  port,
  fetch(req, srv) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return new Response("ok");
    }
    const ok = srv.upgrade(req, { data: { id: nextId() } });
    if (ok) return undefined;
    return new Response("expected a websocket upgrade", { status: 426 });
  },
  websocket: {
    open(ws) {
      sockets.set(ws.data.id, ws);
    },
    message(ws, raw) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(typeof raw === "string" ? raw : raw.toString());
      } catch {
        sendError(ws, "bad-message");
        return;
      }
      const result = clientMessageSchema.safeParse(parsed);
      if (!result.success) {
        sendError(ws, "bad-message");
        return;
      }
      manager.handle(ws.data.id, result.data);
    },
    close(ws) {
      sockets.delete(ws.data.id);
      manager.disconnect(ws.data.id);
    },
  },
});

// sweep idle empty rooms every minute
setInterval(() => manager.sweepIdle(5 * 60 * 1000), 60 * 1000);

console.log(`ws-server listening on :${server.port}`);
