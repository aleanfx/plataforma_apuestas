import crypto from "node:crypto";
import type { Hub, Table } from "../../realtime/hub.js";
import { PokerEngine, type PokerOptions } from "./engine.js";

export function createPokerMesa(
  hub: Hub,
  opts: { id?: string; name: string } & PokerOptions,
): Table {
  const engine = new PokerEngine(opts);
  const id = opts.id ?? `poker-${crypto.randomUUID()}`;
  // `stake` de la mesa = buy-in (lo que se muestra y se cobra al sentarse).
  const table = hub.createTable({ id, name: opts.name, stake: opts.buyIn, engine });
  engine.attach(table, () => hub.broadcast(table));
  return table;
}

// Mesas fijas de póker (todo en céntimos). BB = Bs.1, SB = Bs.0,50.
export function initPoker(hub: Hub) {
  createPokerMesa(hub, {
    id: "poker-100",
    name: "Póker · Buy-in Bs. 100",
    seats: 5,
    buyIn: 10000,
    smallBlind: 50,
    bigBlind: 100,
  });
  createPokerMesa(hub, {
    id: "poker-500",
    name: "Póker · Buy-in Bs. 500",
    seats: 5,
    buyIn: 50000,
    smallBlind: 250,
    bigBlind: 500,
  });
}
