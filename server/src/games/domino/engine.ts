import type { GameEngine, GameAction } from "../../realtime/engine.js";
import type { Table } from "../../realtime/hub.js";
import type { SocketUser } from "../../realtime/auth.js";
import { badRequest } from "../../errors.js";
import { realEscrow, type Escrow } from "../../realtime/escrow.js";
import {
  fullSet,
  shuffle,
  starterTile,
  playableEnds,
  handPips,
  pip,
  type Tile,
} from "./tiles.js";

type Phase = "waiting" | "playing" | "finished";
type Placed = { a: number; b: number }; // ficha orientada izq->der en la mesa
type Seated = { userId: string; name: string };
const HAND_SIZE = 7;

// Dominó "cerrado" (block dominoes), 2-4 jugadores. En mesa de 4 se juega por
// parejas (asientos 0&2 vs 1&3). Server-authoritative: reparte, valida cada
// jugada, detecta dominó/tranque y reparte el pozo por el ledger.
export class DominoEngine implements GameEngine {
  readonly game = "domino" as const;
  readonly maxPlayers: number;

  private phase: Phase = "waiting";
  private seated: Seated[] = []; // lista de espera (orden de llegada)
  private order: string[] = []; // userIds en orden de juego (fijado al iniciar)
  private hands = new Map<string, Tile[]>();
  private names = new Map<string, string>();
  private board: Placed[] = [];
  private leftEnd: number | null = null;
  private rightEnd: number | null = null;
  private turn = 0; // índice en `order`
  private passes = 0;
  private pot = 0;
  private starterTileId: string | null = null;
  private winners: { id: string; name: string; amount: number }[] = [];

  private resetTimer: NodeJS.Timeout | null = null;
  private turnTimer: NodeJS.Timeout | null = null;
  private turnDeadline: number | null = null;
  private table!: Table;
  private notify: () => void = () => {};
  private readonly resetDelayMs: number;
  private readonly turnTimeoutMs: number;
  private readonly escrow: Escrow;

  constructor(opts: {
    seats: 2 | 3 | 4;
    resetDelayMs?: number;
    turnTimeoutMs?: number;
    escrow?: Escrow;
  }) {
    this.maxPlayers = opts.seats;
    this.resetDelayMs = opts.resetDelayMs ?? 8000;
    // Tiempo máximo por turno; al agotarse, el servidor juega/pasa automáticamente.
    // Evita que un jugador AFK o desconectado congele la mesa. 0 = desactivado.
    this.turnTimeoutMs = opts.turnTimeoutMs ?? 25000;
    this.escrow = opts.escrow ?? realEscrow;
  }

  /** Limpia timers (al destruir una mesa de práctica). */
  dispose() {
    if (this.resetTimer) clearTimeout(this.resetTimer);
    if (this.turnTimer) clearTimeout(this.turnTimer);
    this.resetTimer = this.turnTimer = null;
  }

  attach(table: Table, notify: () => void) {
    this.table = table;
    this.notify = notify;
  }

  canJoin(_table: Table, user: SocketUser): { ok: boolean; reason?: string } {
    if (this.phase !== "waiting") return { ok: false, reason: "La partida ya está en curso" };
    if (this.seated.some((s) => s.userId === user.id)) return { ok: true };
    if (this.seated.length >= this.maxPlayers) return { ok: false, reason: "Mesa llena" };
    return { ok: true };
  }

  onJoin(_table: Table, user: SocketUser): void {
    this.names.set(user.id, user.name);
    if (this.phase === "waiting" && !this.seated.some((s) => s.userId === user.id)) {
      this.seated.push({ userId: user.id, name: user.name });
    }
  }

  onLeave(_table: Table, userId: string): void {
    // Solo se puede abandonar el asiento antes de iniciar.
    if (this.phase === "waiting") {
      this.seated = this.seated.filter((s) => s.userId !== userId);
    }
  }

  async onAction(_table: Table, user: SocketUser, action: GameAction): Promise<void> {
    switch (action.type) {
      case "start":
        await this.start();
        break;
      case "play":
        this.play(user, String(action.tileId), action.end === "left" ? "left" : "right");
        break;
      case "pass":
        this.pass(user);
        break;
      default:
        throw badRequest("Acción de dominó desconocida");
    }
  }

  // --- Inicio / reparto ---------------------------------------------------

  private async start() {
    if (this.phase !== "waiting") throw badRequest("La partida ya está en curso");
    if (this.seated.length < 2) throw badRequest("Se necesitan al menos 2 jugadores");

    const players = [...this.seated];
    // Verifica saldo de todos antes de cobrar a nadie.
    for (const p of players) {
      if ((await this.escrow.balanceOf(p.userId)) < this.table.stake) {
        throw badRequest(`${p.name} no tiene saldo suficiente para la apuesta`);
      }
    }
    // Cobra a todos; si algo falla, reintegra lo ya cobrado.
    const charged: string[] = [];
    try {
      for (const p of players) {
        await this.escrow.chargeStake(p.userId, this.table.stake, this.table.id);
        charged.push(p.userId);
      }
    } catch (err) {
      for (const id of charged) await this.escrow.refundStake(id, this.table.stake, this.table.id);
      throw err;
    }

    // Reparte 7 fichas a cada jugador.
    const deck = shuffle(fullSet());
    this.order = players.map((p) => p.userId);
    this.hands.clear();
    this.order.forEach((uid, i) => {
      this.hands.set(uid, deck.slice(i * HAND_SIZE, i * HAND_SIZE + HAND_SIZE));
    });

    // Quien tenga la ficha de salida (doble más alto) empieza, y debe jugarla.
    const all = this.order.flatMap((uid) => this.hands.get(uid)!);
    const starter = starterTile(all);
    this.starterTileId = starter.id;
    this.turn = this.order.findIndex((uid) => this.hands.get(uid)!.some((t) => t.id === starter.id));

    this.board = [];
    this.leftEnd = null;
    this.rightEnd = null;
    this.passes = 0;
    this.pot = this.table.stake * this.order.length;
    this.winners = [];
    this.phase = "playing";
    this.table.status = "playing";
    this.notify();
    this.syncTurnTimer();
  }

  // --- Jugar / pasar ------------------------------------------------------

  private requireTurn(user: SocketUser) {
    if (this.phase !== "playing") throw badRequest("La partida no está en curso");
    if (this.order[this.turn] !== user.id) throw badRequest("No es tu turno");
  }

  private play(user: SocketUser, tileId: string, end: "left" | "right") {
    this.requireTurn(user);
    this.doPlay(user.id, tileId, end);
  }

  // Coloca una ficha por userId (sin validar el turno: lo usa también el auto-juego).
  private doPlay(userId: string, tileId: string, end: "left" | "right") {
    const hand = this.hands.get(userId)!;
    const tile = hand.find((t) => t.id === tileId);
    if (!tile) throw badRequest("No tienes esa ficha");

    if (this.board.length === 0) {
      // Primera jugada: debe ser la ficha de salida.
      if (tile.id !== this.starterTileId) throw badRequest("Debes salir con la ficha de salida");
      this.board.push({ a: tile.a, b: tile.b });
      this.leftEnd = tile.a;
      this.rightEnd = tile.b;
    } else {
      this.placeOnEnd(tile, end);
    }

    this.hands.set(
      userId,
      hand.filter((t) => t.id !== tileId),
    );
    this.passes = 0;

    if (this.hands.get(userId)!.length === 0) {
      // ¡Dominó! Gana quien se pega (y su pareja).
      void this.finish(this.winningSide(userId), "domino");
      return;
    }
    this.advanceTurn();
    this.notify();
    this.syncTurnTimer();
  }

  private placeOnEnd(tile: Tile, end: "left" | "right") {
    const valid = playableEnds(tile, this.leftEnd!, this.rightEnd!);
    if (!valid.includes(end)) throw badRequest("Esa ficha no encaja en ese extremo");

    if (end === "right") {
      if (tile.a === this.rightEnd) {
        this.board.push({ a: tile.a, b: tile.b });
        this.rightEnd = tile.b;
      } else {
        this.board.push({ a: tile.b, b: tile.a });
        this.rightEnd = tile.a;
      }
    } else {
      if (tile.a === this.leftEnd) {
        this.board.unshift({ a: tile.b, b: tile.a });
        this.leftEnd = tile.b;
      } else {
        this.board.unshift({ a: tile.a, b: tile.b });
        this.leftEnd = tile.a;
      }
    }
  }

  private pass(user: SocketUser) {
    this.requireTurn(user);
    this.doPass(user.id);
  }

  // Pasa por userId (sin validar el turno: lo usa también el auto-juego).
  private doPass(userId: string) {
    const hand = this.hands.get(userId)!;
    const hasMove =
      this.board.length === 0
        ? hand.some((t) => t.id === this.starterTileId)
        : hand.some((t) => playableEnds(t, this.leftEnd!, this.rightEnd!).length > 0);
    if (hasMove) throw badRequest("Tienes una jugada válida; no puedes pasar");

    this.passes++;
    if (this.passes >= this.order.length) {
      // Tranque: nadie puede jugar. Gana el menor puntaje (pareja en mesa de 4).
      void this.finish(this.lowestSide(), "tranque");
      return;
    }
    this.advanceTurn();
    this.notify();
    this.syncTurnTimer();
  }

  private advanceTurn() {
    this.turn = (this.turn + 1) % this.order.length;
  }

  // --- Temporizador de turno ---------------------------------------------

  // (Re)arma el contador del turno actual. Al agotarse, el servidor juega solo.
  private syncTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.phase === "playing" && this.turnTimeoutMs > 0) {
      this.turnDeadline = Date.now() + this.turnTimeoutMs;
      this.turnTimer = setTimeout(() => this.onTurnTimeout(), this.turnTimeoutMs);
      this.turnTimer.unref?.(); // no mantener vivo el proceso por este timer
    } else {
      this.turnDeadline = null;
    }
  }

  // Al agotarse el turno: juega la primera ficha legal; si no hay, pasa.
  private onTurnTimeout() {
    if (this.phase !== "playing") return;
    const uid = this.order[this.turn];
    const hand = this.hands.get(uid) ?? [];
    if (this.board.length === 0) {
      const starter = hand.find((t) => t.id === this.starterTileId);
      if (starter) return this.doPlay(uid, starter.id, "left");
    } else {
      for (const t of hand) {
        const ends = playableEnds(t, this.leftEnd!, this.rightEnd!);
        if (ends.length > 0) return this.doPlay(uid, t.id, ends[0]);
      }
    }
    this.doPass(uid);
  }

  // --- Equipos / ganadores ------------------------------------------------

  private teamOf(seat: number): number {
    // En mesa de 4: parejas {0,2} y {1,3}. Si no, cada quien es su propio equipo.
    return this.order.length === 4 ? seat % 2 : seat;
  }

  private winningSide(userId: string): string[] {
    const seat = this.order.indexOf(userId);
    const team = this.teamOf(seat);
    return this.order.filter((_, i) => this.teamOf(i) === team);
  }

  private lowestSide(): string[] {
    // Suma de puntos por equipo; gana el menor. Empate -> se reparte entre los empatados.
    const teamPips = new Map<number, number>();
    this.order.forEach((uid, seat) => {
      const t = this.teamOf(seat);
      teamPips.set(t, (teamPips.get(t) ?? 0) + handPips(this.hands.get(uid)!));
    });
    const min = Math.min(...teamPips.values());
    const winningTeams = [...teamPips.entries()].filter(([, v]) => v === min).map(([t]) => t);
    return this.order.filter((_, seat) => winningTeams.includes(this.teamOf(seat)));
  }

  private async finish(winnerIds: string[], reason: "domino" | "tranque") {
    const share = Math.floor(this.pot / winnerIds.length);
    let remainder = this.pot - share * winnerIds.length;
    this.winners = [];
    for (const id of winnerIds) {
      const amount = share + (remainder > 0 ? 1 : 0);
      if (remainder > 0) remainder--;
      await this.escrow.payout(id, amount, this.table.id, reason === "domino" ? "Dominó ganado" : "Dominó (tranque)");
      this.winners.push({ id, name: this.names.get(id) ?? "Jugador", amount });
    }
    this.phase = "finished";
    this.table.status = "finished";
    this.notify();
    this.syncTurnTimer(); // limpia el contador de turno
    this.resetTimer = setTimeout(() => this.reset(), this.resetDelayMs);
  }

  private reset() {
    this.phase = "waiting";
    this.order = [];
    this.hands.clear();
    this.board = [];
    this.leftEnd = null;
    this.rightEnd = null;
    this.turn = 0;
    this.passes = 0;
    this.pot = 0;
    this.starterTileId = null;
    this.winners = [];
    this.table.status = "waiting";
    this.notify();
    this.syncTurnTimer(); // limpia el contador de turno
  }

  // --- Estado público (por jugador) --------------------------------------

  publicState(_table: Table, forUserId: string): unknown {
    const inGame = this.phase === "playing" || this.phase === "finished";
    const list = inGame ? this.order : this.seated.map((s) => s.userId);

    const seats = list.map((uid, seat) => ({
      id: uid,
      name: this.names.get(uid) ?? "Jugador",
      handCount: this.hands.get(uid)?.length ?? 0,
      team: inGame ? this.teamOf(seat) : seat,
      isTurn: inGame && this.phase === "playing" && seat === this.turn,
    }));

    const myHand = this.hands.get(forUserId) ?? [];
    const mySeat = list.indexOf(forUserId);
    const myTurn = inGame && this.phase === "playing" && this.order[this.turn] === forUserId;

    let myLegalMoves: { tileId: string; ends: ("left" | "right")[] }[] = [];
    if (myTurn) {
      if (this.board.length === 0) {
        myLegalMoves = myHand
          .filter((t) => t.id === this.starterTileId)
          .map((t) => ({ tileId: t.id, ends: ["left"] as ("left" | "right")[] }));
      } else {
        myLegalMoves = myHand
          .map((t) => ({ tileId: t.id, ends: playableEnds(t, this.leftEnd!, this.rightEnd!) }))
          .filter((m) => m.ends.length > 0);
      }
    }

    return {
      phase: this.phase,
      pot: this.pot,
      stake: this.table.stake,
      seats,
      board: this.board,
      leftEnd: this.leftEnd,
      rightEnd: this.rightEnd,
      turn: this.phase === "playing" ? this.turn : null,
      turnUserId: this.phase === "playing" ? this.order[this.turn] : null,
      myHand,
      mySeat,
      myTurn,
      myLegalMoves,
      mustPass: myTurn && myLegalMoves.length === 0,
      starterTileId: this.starterTileId,
      winners: this.winners,
      seatsNeeded: this.maxPlayers,
      turnEndsAt: this.phase === "playing" ? this.turnDeadline : null,
      turnTimeoutMs: this.turnTimeoutMs,
    };
  }
}
