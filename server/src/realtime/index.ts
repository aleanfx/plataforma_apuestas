import type { Server, Socket } from "socket.io";
import type { GameKind } from "@prisma/client";
import { socketAuth } from "./auth.js";
import { Hub } from "./hub.js";
import type { GameAction } from "./engine.js";
import { createPracticeTable } from "../games/practice.js";

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

    // Crea una mesa de práctica vs CPU (dinero de juguete) y devuelve su id.
    socket.on("table:practice", (data: { game?: GameKind } = {}, ack?: Ack) => {
      try {
        const table = createPracticeTable(hub, data?.game ?? "bingo");
        ack?.({ ok: true, tableId: table.id });
      } catch (err) {
        ack?.({ ok: false, reason: err instanceof Error ? err.message : "No se pudo crear la práctica" });
      }
    });

    socket.on(
      "table:action",
      async (data: { tableId?: string; action?: GameAction } = {}, ack?: Ack) => {
        const res = await hub.action(socket, data?.tableId ?? "", data?.action ?? { type: "" });
        ack?.(res);
      },
    );

    socket.on("table:chat", (data: { tableId?: string; text?: string } = {}) => {
      hub.chat(socket, data?.tableId ?? "", data?.text ?? "");
    });

    socket.on("disconnect", () => hub.handleDisconnect(socket));
  });

  return hub;
}
