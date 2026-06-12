import crypto from "node:crypto";
import type { GameEngine, GameAction } from "../../realtime/engine.js";
import type { Table } from "../../realtime/hub.js";
import type { SocketUser } from "../../realtime/auth.js";
import { badRequest } from "../../errors.js";
import { chargeStake, payout } from "../../realtime/escrow.js";
import { genCarton, hasLine, markGrid, ballLetter, MAX_BALL, type Carton } from "./cards.js";

type Phase = "buying" | "playing" | "finished";
const MAX_CARTONES_PER_PLAYER = 4;

export type BingoOptions = {
  callIntervalMs?: number; // ritmo del canto automático
  resetDelayMs?: number; // pausa antes de la siguiente ronda
  autoStartMs?: number; // arranque automático tras la 1.ª compra (0 = desactivado)
};

// Motor de Bingo (75 bolas, gana la primera LÍNEA). Una instancia por sala.
// El servidor es la autoridad: genera cartones, canta números, detecta ganador
// y reparte el pozo por el ledger (escrow). El cliente solo muestra.
export class BingoEngine implements GameEngine {
  readonly game = "bingo" as const;
  readonly maxPlayers = 30;

  private phase: Phase = "buying";
  private called: number[] = [];
  private cartones = new Map<string, Carton[]>();
  private names = new Map<string, string>();
  private pot = 0;
  private winners: { id: string; name: string; amount: number }[] = [];

  private callTimer: NodeJS.Timeout | null = null;
  private resetTimer: NodeJS.Timeout | null = null;
  private autoStartTimer: NodeJS.Timeout | null = null;
  private finishing = false;

  private table!: Table;
  private notify: () => void = () => {};

  private readonly callIntervalMs: number;
  private readonly resetDelayMs: number;
  private readonly autoStartMs: number;

  constructor(opts: BingoOptions = {}) {
    this.callIntervalMs = opts.callIntervalMs ?? 2500;
    this.resetDelayMs = opts.resetDelayMs ?? 8000;
    this.autoStartMs = opts.autoStartMs ?? 20000;
  }

  /** Conecta el motor a su mesa y a la función de difusión del Hub. */
  attach(table: Table, notify: () => void) {
    this.table = table;
    this.notify = notify;
  }

  canJoin(): { ok: boolean; reason?: string } {
    return { ok: true };
  }

  onJoin(_table: Table, user: SocketUser): void {
    this.names.set(user.id, user.name);
    if (!this.cartones.has(user.id)) this.cartones.set(user.id, []);
  }

  onLeave(): void {
    // No se quitan cartones: si el jugador compró, sigue en juego aunque se vaya.
  }

  async onAction(_table: Table, user: SocketUser, action: GameAction): Promise<void> {
    switch (action.type) {
      case "buy":
        await this.buy(user);
        break;
      case "start":
        this.start();
        break;
      default:
        throw badRequest("Acción de bingo desconocida");
    }
  }

  // --- Compra ------------------------------------------------------------

  private async buy(user: SocketUser) {
    if (this.phase !== "buying") throw badRequest("La ronda ya empezó; espera la siguiente");
    const mine = this.cartones.get(user.id) ?? [];
    if (mine.length >= MAX_CARTONES_PER_PLAYER) {
      throw badRequest(`Máximo ${MAX_CARTONES_PER_PLAYER} cartones por ronda`);
    }
    // Cobra la apuesta (lanza "Saldo insuficiente" si no alcanza) ANTES del cartón.
    await chargeStake(user.id, this.table.stake, this.table.id);
    mine.push(genCarton());
    this.cartones.set(user.id, mine);
    this.names.set(user.id, user.name);
    this.pot += this.table.stake;

    // Programa el arranque automático tras la primera compra.
    if (this.autoStartMs > 0 && !this.autoStartTimer) {
      this.autoStartTimer = setTimeout(() => {
        if (this.phase === "buying") this.start();
      }, this.autoStartMs);
    }
  }

  // --- Ronda -------------------------------------------------------------

  private start() {
    if (this.phase !== "buying") throw badRequest("La ronda ya está en curso");
    const total = [...this.cartones.values()].reduce((s, c) => s + c.length, 0);
    if (total < 1) throw badRequest("No hay cartones en juego");

    if (this.autoStartTimer) {
      clearTimeout(this.autoStartTimer);
      this.autoStartTimer = null;
    }
    this.phase = "playing";
    this.table.status = "playing";
    this.callTimer = setInterval(() => void this.callNext(), this.callIntervalMs);
    this.notify();
  }

  private async callNext() {
    if (this.phase !== "playing" || this.finishing) return;

    const remaining: number[] = [];
    for (let n = 1; n <= MAX_BALL; n++) if (!this.called.includes(n)) remaining.push(n);
    if (remaining.length === 0) return;

    this.called.push(remaining[crypto.randomInt(remaining.length)]);
    const calledSet = new Set(this.called);
    const winnerIds = this.findWinners(calledSet);

    if (winnerIds.length > 0) {
      this.finishing = true;
      if (this.callTimer) clearInterval(this.callTimer);
      this.callTimer = null;
      await this.finish(winnerIds);
    } else {
      this.notify();
    }
  }

  private findWinners(called: Set<number>): string[] {
    const w: string[] = [];
    for (const [userId, cartones] of this.cartones) {
      if (cartones.some((c) => hasLine(c, called))) w.push(userId);
    }
    return w;
  }

  private async finish(winnerIds: string[]) {
    const share = Math.floor(this.pot / winnerIds.length);
    let remainder = this.pot - share * winnerIds.length;
    this.winners = [];
    for (const id of winnerIds) {
      const amount = share + (remainder > 0 ? 1 : 0); // el céntimo sobrante al primero
      if (remainder > 0) remainder--;
      await payout(id, amount, this.table.id, "Premio de Bingo");
      this.winners.push({ id, name: this.names.get(id) ?? "Jugador", amount });
    }
    this.phase = "finished";
    this.table.status = "finished";
    this.finishing = false;
    this.notify();
    this.resetTimer = setTimeout(() => this.reset(), this.resetDelayMs);
  }

  private reset() {
    this.phase = "buying";
    this.called = [];
    this.cartones.clear();
    this.pot = 0;
    this.winners = [];
    this.table.status = "waiting";
    this.notify();
  }

  publicState(_table: Table, forUserId: string): unknown {
    const calledSet = new Set(this.called);
    const myCartones = (this.cartones.get(forUserId) ?? []).map((c) => ({
      id: c.id,
      grid: c.grid,
      marked: markGrid(c, calledSet),
      hasLine: hasLine(c, calledSet),
    }));
    const last = this.called[this.called.length - 1] ?? null;
    return {
      phase: this.phase,
      pot: this.pot,
      stake: this.table.stake,
      called: this.called,
      lastCalled: last,
      lastLabel: last ? `${ballLetter(last)}-${last}` : null,
      players: [...this.cartones.entries()].map(([id, cs]) => ({
        id,
        name: this.names.get(id) ?? "Jugador",
        cartones: cs.length,
      })),
      myCartones,
      winners: this.winners,
    };
  }
}
