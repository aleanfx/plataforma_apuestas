import type { Server, Socket } from "socket.io";
import type { GameKind } from "@prisma/client";
import { socketAuth } from "./auth.js";
import { Hub } from "./hub.js";
import type { GameAction } from "./engine.js";

// Hub singleton: los módulos de juego (Bingo/Dominó/Póker) crean mesas con él.
export let hub: Hub;

type Ack = (res: unknown) => void;

export function initRealtime(io: Server): Hub {
  hub = new Hub(io);

  // Todo socket debe autenticarse en el handshake (JWT bearer).
  io.use((socket, next) => {
    void socketAuth(socket, next);
  });

  io.on("connection", (socket: Socket) => {
    hub.handleConnection(socket);

    socket.on("table:list", (data: { game?: GameKind } = {}, ack?: Ack) => {
      ack?.({ tables: hub.listTables(data?.game) });
    });

    socket.on("table:join", (data: { tableId?: string } = {}, ack?: Ack) => {
      ack?.(hub.join(socket, data?.tableId ?? ""));
    });

    socket.on("table:leave", (data: { tableId?: string } = {}) => {
      hub.leave(socket, data?.tableId ?? "");
    });

    socket.on(
      "table:action",
      async (data: { tableId?: string; action?: GameAction } = {}, ack?: Ack) => {
        const res = await hub.action(socket, data?.tableId ?? "", data?.action ?? { type: "" });
        ack?.(res);
      },
    );

    socket.on("disconnect", () => hub.handleDisconnect(socket));
  });

  return hub;
}
