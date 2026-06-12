import crypto from "node:crypto";
import type { Hub, Table } from "../../realtime/hub.js";
import { BingoEngine, type BingoOptions } from "./engine.js";

// Crea una sala de bingo y la registra en el Hub. Una sala = una mesa + un motor.
export function createBingoSala(
  hub: Hub,
  opts: { id?: string; name: string; stake: number } & BingoOptions,
): Table {
  const engine = new BingoEngine(opts);
  const id = opts.id ?? `bingo-${crypto.randomUUID()}`;
  const table = hub.createTable({ id, name: opts.name, stake: opts.stake, engine });
  engine.attach(table, () => hub.broadcast(table));
  return table;
}

// Salas fijas que existen siempre (distintos precios de cartón, en céntimos).
export function initBingo(hub: Hub) {
  createBingoSala(hub, { id: "bingo-20", name: "Bingo · Bs. 20", stake: 2000 });
  createBingoSala(hub, { id: "bingo-50", name: "Bingo · Bs. 50", stake: 5000 });
  createBingoSala(hub, { id: "bingo-100", name: "Bingo · Bs. 100", stake: 10000 });
}
