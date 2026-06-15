import crypto from "node:crypto";
import type { GameKind } from "@prisma/client";
import type { Hub, Table } from "../realtime/hub.js";
import { badRequest } from "../errors.js";
import { practiceEscrow } from "../realtime/escrow.js";
import {
  BotController,
  makeBots,
  decideBingo,
  decideDomino,
  decidePoker,
  type BotUser,
  type BotDecider,
} from "../realtime/bots.js";
import { BingoEngine } from "./bingo/engine.js";
import { DominoEngine } from "./domino/engine.js";
import { PokerEngine } from "./poker/engine.js";

type Attachable = { attach(table: Table, notify: () => void): void };

// Crea una mesa de práctica vs CPU: dinero de juguete (practiceEscrow) + bots que
// juegan solos. La mesa se autodestruye cuando el humano se va (ver Hub.cleanupPractice).
export function createPracticeTable(hub: Hub, game: GameKind): Table {
  const id = `practice-${game}-${crypto.randomUUID()}`;

  if (game === "bingo") {
    const engine = new BingoEngine({
      escrow: practiceEscrow,
      callIntervalMs: 1400,
      resetDelayMs: 6000,
      autoStartMs: 12000, // da tiempo a comprar; luego arranca solo
    });
    const table = hub.createTable({ id, name: "Bingo · Práctica vs CPU", stake: 2000, engine });
    wire(hub, table, engine, makeBots(4), decideBingo);
    return table;
  }

  if (game === "domino") {
    const engine = new DominoEngine({ seats: 4, escrow: practiceEscrow, resetDelayMs: 6000, turnTimeoutMs: 20000 });
    const table = hub.createTable({ id, name: "Dominó Parejas · Práctica vs CPU", stake: 5000, engine });
    wire(hub, table, engine, makeBots(3), decideDomino);
    return table;
  }

  if (game === "poker") {
    const engine = new PokerEngine({
      seats: 4,
      buyIn: 10000,
      smallBlind: 50,
      bigBlind: 100,
      escrow: practiceEscrow,
      handDelayMs: 3500,
      turnTimeoutMs: 20000,
    });
    const table = hub.createTable({ id, name: "Póker · Práctica vs CPU", stake: 10000, engine });
    wire(hub, table, engine, makeBots(3), decidePoker);
    return table;
  }

  throw badRequest("Juego no válido para práctica");
}

function wire(hub: Hub, table: Table, engine: Attachable, bots: BotUser[], decide: BotDecider) {
  table.practice = true;
  const controller = new BotController(hub, table, bots, decide);
  table.bots = controller;
  // El notify del motor difunde y, además, deja actuar a los bots.
  engine.attach(table, () => {
    hub.broadcast(table);
    controller.onState();
  });
  for (const b of bots) hub.addBot(table, b);
}
