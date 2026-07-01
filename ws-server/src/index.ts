import type { WebSocketData } from "@socket.io/bun-engine";
import { Server as Engine } from "@socket.io/bun-engine";
import { Server } from "socket.io";
import { clientMessageSchema, type ServerMessage } from "./protocol";
import { RoomManager } from "./room-manager";

const port = Number(process.env.PORT ?? 3001);

const io = new Server({
  cors: { origin: "*" },
});

const engine = new Engine({
  path: "/socket.io/",
});

io.bind(engine);

const manager = new RoomManager({
  send: (playerId, message: ServerMessage) => {
    io.to(playerId).emit("message", message);
  },
});

io.on("connection", (socket) => {
  // each socket joins its own id as a room, so send() can target one player
  socket.join(socket.id);

  socket.on("message", (raw: unknown) => {
    const result = clientMessageSchema.safeParse(raw);
    if (!result.success) {
      const msg: ServerMessage = { type: "error", reason: "bad-message" };
      socket.emit("message", msg);
      return;
    }
    manager.handle(socket.id, result.data);
  });

  socket.on("disconnect", () => {
    manager.disconnect(socket.id);
  });
});

// sweep idle empty rooms every minute
setInterval(() => manager.sweepIdle(5 * 60 * 1000), 60 * 1000);

console.log(`ws-server listening on :${port}`);

const engineHandler = engine.handler();

export default {
  port,
  ...engineHandler,
  fetch(req: Request, server: Bun.Server<WebSocketData>) {
    const url = new URL(req.url);
    if (url.pathname === "/health") {
      return new Response("ok");
    }
    return engineHandler.fetch(req, server);
  },
};
