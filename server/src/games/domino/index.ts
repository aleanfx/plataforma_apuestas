import crypto from "node:crypto";
import type { Hub, Table } from "../../realtime/hub.js";
import { DominoEngine } from "./engine.js";

export function createDominoMesa(
  hub: Hub,
  opts: { id?: string; name: string; stake: number; seats: 2 | 3 | 4; resetDelayMs?: number },
): Table {
  const engine = new DominoEngine({ seats: opts.seats, resetDelayMs: opts.resetDelayMs });
  const id = opts.id ?? `domino-${crypto.randomUUID()}`;
  const table = hub.createTable({ id, name: opts.name, stake: opts.stake, engine });
  engine.attach(table, () => hub.broadcast(table));
  return table;
}

// Mesas fijas de dominó (stake en céntimos).
export function initDomino(hub: Hub) {
  createDominoMesa(hub, { id: "domino-2-50", name: "Dominó 1v1 · Bs. 50", stake: 5000, seats: 2 });
  createDominoMesa(hub, { id: "domino-4-100", name: "Dominó Parejas · Bs. 100", stake: 10000, seats: 4 });
}
