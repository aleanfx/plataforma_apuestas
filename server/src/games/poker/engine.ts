import type { GameEngine, GameAction } from "../../realtime/engine.js";
import type { Table } from "../../realtime/hub.js";
import type { SocketUser } from "../../realtime/auth.js";
import { badRequest } from "../../errors.js";
import { realEscrow, type Escrow } from "../../realtime/escrow.js";
import { fullDeck, shuffle, type Card } from "./cards.js";
import { computeSidePots } from "./sidepots.js";
import { winnersAmong, handName } from "./handeval.js";

type Street = "preflop" | "flop" | "turn" | "river" | "idle";

type PokerPlayer = {
  userId: string;
  name: string;
  chips: number; // fichas en la mesa (= dinero real escrowed)
  hole: Card[];
  folded: boolean;
  allIn: boolean;
  roundBet: number; // apostado en la ronda actual
  totalBet: number; // apostado en toda la mano (para side pots)
  hasActed: boolean;
  inHand: boolean;
  leaving: boolean;
};

type ShowdownEntry = { id: string; name: string; amount: number; hand?: string; hole?: Card[] };

export type PokerOptions = {
  seats: number;
  buyIn: number; // céntimos
  smallBlind: number;
  bigBlind: number;
  handDelayMs?: number;
  turnTimeoutMs?: number;
  escrow?: Escrow;
};

// Texas Hold'em (cash game). El buy-in debita la billetera y entrega fichas;
// al retirarse se acreditan las fichas restantes (todo por el ledger/escrow).
// Dentro de la mano las fichas se mueven entre jugadores (suma cero). Autoridad
// total del servidor: barajado, turnos, side pots y showdown con pokersolver.
export class PokerEngine implements GameEngine {
  readonly game = "poker" as const;
  readonly maxPlayers: number;

  private players: PokerPlayer[] = [];
  private phase: "waiting" | "playing" = "waiting";
  private street: Street = "idle";
  private community: Card[] = [];
  private deck: Card[] = [];
  private button = -1;
  private currentBet = 0;
  private minRaise = 0;
  private toAct = -1; // índice de asiento
  private handActive = false;
  private lastShowdown: ShowdownEntry[] = [];

  private handTimer: NodeJS.Timeout | null = null;
  private turnTimer: NodeJS.Timeout | null = null;
  private turnDeadline: number | null = null;
  private table!: Table;
  private notify: () => void = () => {};

  private readonly buyIn: number;
  private readonly smallBlind: number;
  private readonly bigBlind: number;
  private readonly handDelayMs: number;
  private readonly turnTimeoutMs: number;
  private readonly escrow: Escrow;

  constructor(opts: PokerOptions) {
    this.maxPlayers = opts.seats;
    this.buyIn = opts.buyIn;
    this.smallBlind = opts.smallBlind;
    this.bigBlind = opts.bigBlind;
    this.handDelayMs = opts.handDelayMs ?? 6000;
    // Tiempo máximo por turno; al agotarse: auto-check si puede, si no auto-fold.
    // Evita que un jugador AFK/desconectado congele la mano. 0 = desactivado.
    this.turnTimeoutMs = opts.turnTimeoutMs ?? 25000;
    this.escrow = opts.escrow ?? realEscrow;
  }

  /** Limpia timers (al destruir una mesa de práctica). */
  dispose() {
    if (this.handTimer) clearTimeout(this.handTimer);
    if (this.turnTimer) clearTimeout(this.turnTimer);
    this.handTimer = this.turnTimer = null;
  }

  attach(table: Table, notify: () => void) {
    this.table = table;
    this.notify = notify;
  }

  canJoin(_table: Table, user: SocketUser): { ok: boolean; reason?: string } {
    if (this.players.some((p) => p.userId === user.id)) return { ok: true };
    if (this.players.length >= this.maxPlayers) return { ok: false, reason: "Mesa llena" };
    return { ok: true };
  }

  onJoin(_table: Table, user: SocketUser): void {
    if (this.players.some((p) => p.userId === user.id)) return;
    this.players.push({
      userId: user.id,
      name: user.name,
      chips: 0,
      hole: [],
      folded: false,
      allIn: false,
      roundBet: 0,
      totalBet: 0,
      hasActed: false,
      inHand: false,
      leaving: false,
    });
  }

  async onLeave(_table: Table, userId: string): Promise<void> {
    const seat = this.players.findIndex((p) => p.userId === userId);
    if (seat < 0) return;
    const p = this.players[seat];

    if (this.handActive && p.inHand && !p.folded) {
      p.folded = true;
      p.hasActed = true;
      if (this.toAct === seat) this.afterAction(seat);
      else this.checkFoldWin();
    }
    await this.cashOut(p); // acredita su stack (lo ya apostado queda en el pozo)
    p.leaving = true;
    if (!this.handActive) this.removePlayer(userId);
    this.notify();
    this.syncTurnTimer();
  }

  private removePlayer(userId: string) {
    this.players = this.players.filter((p) => p.userId !== userId);
  }

  private async cashOut(p: PokerPlayer) {
    if (p.chips > 0) {
      const amount = p.chips;
      p.chips = 0;
      await this.escrow.payout(p.userId, amount, this.table.id, "Retiro de fichas de póker");
    }
  }

  async onAction(_table: Table, user: SocketUser, action: GameAction): Promise<void> {
    if (action.type === "buyin") return this.buyin(user);
    const seat = this.players.findIndex((p) => p.userId === user.id);
    if (seat < 0) throw badRequest("No estás en la mesa");
    if (!this.handActive) throw badRequest("No hay mano en curso");
    if (this.toAct !== seat) throw badRequest("No es tu turno");

    switch (action.type) {
      case "fold":
        this.act(seat, { kind: "fold" });
        break;
      case "check":
        this.act(seat, { kind: "check" });
        break;
      case "call":
        this.act(seat, { kind: "call" });
        break;
      case "raise":
        this.act(seat, { kind: "raise", to: Math.floor(Number(action.amount)) });
        break;
      case "allin":
        this.act(seat, { kind: "allin" });
        break;
      default:
        throw badRequest("Acción de póker desconocida");
    }
    this.syncTurnTimer();
  }

  // --- Buy-in / arranque -------------------------------------------------

  private async buyin(user: SocketUser) {
    const p = this.players.find((x) => x.userId === user.id);
    if (!p) throw badRequest("No estás en la mesa");
    if (p.chips > 0) throw badRequest("Ya tienes fichas en la mesa");
    if ((await this.escrow.balanceOf(user.id)) < this.buyIn) throw badRequest("Saldo insuficiente para el buy-in");
    await this.escrow.chargeStake(user.id, this.buyIn, this.table.id);
    p.chips = this.buyIn;
    p.leaving = false;
    this.notify();
    this.maybeStartHand();
  }

  private maybeStartHand() {
    if (this.handActive) return;
    const ready = this.players.filter((p) => p.chips > 0 && !p.leaving);
    if (ready.length >= 2) {
      this.handTimer = setTimeout(() => this.startHand(), this.handDelayMs > 0 ? this.handDelayMs : 1);
    }
  }

  private nextSeat(from: number, pred: (p: PokerPlayer) => boolean): number {
    const n = this.players.length;
    for (let i = 1; i <= n; i++) {
      const seat = (from + i) % n;
      if (pred(this.players[seat])) return seat;
    }
    return -1;
  }

  private startHand() {
    const contenders = this.players.filter((p) => p.chips > 0 && !p.leaving);
    if (contenders.length < 2) {
      this.phase = "waiting";
      return;
    }
    for (const p of this.players) {
      p.inHand = p.chips > 0 && !p.leaving;
      p.hole = [];
      p.folded = false;
      p.allIn = false;
      p.roundBet = 0;
      p.totalBet = 0;
      p.hasActed = false;
    }

    this.button = this.nextSeat(this.button, (p) => p.inHand);
    const inHandCount = this.players.filter((p) => p.inHand).length;

    let sbSeat: number;
    let bbSeat: number;
    if (inHandCount === 2) {
      sbSeat = this.button;
      bbSeat = this.nextSeat(this.button, (p) => p.inHand);
    } else {
      sbSeat = this.nextSeat(this.button, (p) => p.inHand);
      bbSeat = this.nextSeat(sbSeat, (p) => p.inHand);
    }
    this.postBlind(sbSeat, this.smallBlind);
    this.postBlind(bbSeat, this.bigBlind);
    this.currentBet = this.bigBlind;
    this.minRaise = this.bigBlind;

    this.deck = shuffle(fullDeck());
    for (const p of this.players) if (p.inHand) p.hole = [this.deck.pop()!, this.deck.pop()!];

    this.street = "preflop";
    this.community = [];
    this.lastShowdown = [];
    this.toAct = this.nextSeat(bbSeat, (p) => this.canAct(p));
    this.handActive = true;
    this.phase = "playing";
    this.notify();
    this.syncTurnTimer();
  }

  private postBlind(seat: number, amount: number) {
    const p = this.players[seat];
    const pay = Math.min(amount, p.chips);
    p.chips -= pay;
    p.roundBet = pay;
    p.totalBet += pay;
    if (p.chips === 0) p.allIn = true;
  }

  private canAct(p: PokerPlayer): boolean {
    return p.inHand && !p.folded && !p.allIn;
  }

  // --- Acciones de apuesta ----------------------------------------------

  private act(seat: number, a: { kind: "fold" | "check" | "call" | "allin" } | { kind: "raise"; to: number }) {
    const p = this.players[seat];
    switch (a.kind) {
      case "fold":
        p.folded = true;
        break;
      case "check":
        if (p.roundBet !== this.currentBet) throw badRequest("No puedes pasar; hay una apuesta");
        break;
      case "call": {
        const need = this.currentBet - p.roundBet;
        if (need <= 0) throw badRequest("Nada que igualar; usa pasar");
        this.putIn(p, Math.min(need, p.chips));
        break;
      }
      case "allin":
        this.raiseTo(p, p.roundBet + p.chips, true);
        break;
      case "raise":
        this.raiseTo(p, a.to, false);
        break;
    }
    p.hasActed = true;
    this.afterAction(seat);
  }

  private putIn(p: PokerPlayer, amount: number) {
    const pay = Math.min(amount, p.chips);
    p.chips -= pay;
    p.roundBet += pay;
    p.totalBet += pay;
    if (p.chips === 0) p.allIn = true;
  }

  private raiseTo(p: PokerPlayer, to: number, isAllin: boolean) {
    const maxTo = p.roundBet + p.chips;
    if (to > maxTo) to = maxTo;
    const minTo = this.currentBet + this.minRaise;
    const fullStack = to === maxTo;
    if (!isAllin && to < minTo && !fullStack) {
      throw badRequest(`La subida mínima es a ${minTo}`);
    }
    if (to <= this.currentBet && !fullStack) throw badRequest("La subida debe superar la apuesta actual");

    this.putIn(p, to - p.roundBet);
    if (p.roundBet > this.currentBet) {
      const inc = p.roundBet - this.currentBet;
      this.minRaise = Math.max(this.minRaise, inc);
      this.currentBet = p.roundBet;
      // Reabre la ronda: los demás deben volver a actuar.
      for (const q of this.players) if (q !== p && this.canAct(q)) q.hasActed = false;
    }
  }

  private afterAction(_seat: number) {
    if (this.checkFoldWin()) return;
    if (this.roundComplete()) {
      this.advanceStreet();
    } else {
      this.toAct = this.nextSeat(this.toAct, (p) => this.canAct(p) && (!p.hasActed || p.roundBet < this.currentBet));
      this.notify();
    }
  }

  private contenders(): PokerPlayer[] {
    return this.players.filter((p) => p.inHand && !p.folded);
  }

  private checkFoldWin(): boolean {
    const live = this.contenders();
    if (live.length === 1 && this.handActive) {
      this.awardFoldWin(live[0]);
      return true;
    }
    return false;
  }

  private roundComplete(): boolean {
    const live = this.contenders();
    if (live.length <= 1) return true;
    const actionable = live.filter((p) => !p.allIn);
    if (actionable.length === 0) return true;
    return actionable.every((p) => p.hasActed && p.roundBet === this.currentBet);
  }

  private advanceStreet() {
    // Recoge las apuestas de la ronda (ya están en totalBet) y reinicia.
    for (const p of this.players) {
      p.roundBet = 0;
      p.hasActed = false;
    }
    this.currentBet = 0;
    this.minRaise = this.bigBlind;

    const order: Street[] = ["preflop", "flop", "turn", "river"];
    const idx = order.indexOf(this.street);

    if (this.street === "river") {
      this.showdown();
      return;
    }
    // Reparte comunitarias de la siguiente calle.
    this.street = order[idx + 1];
    if (this.street === "flop") this.community.push(this.deck.pop()!, this.deck.pop()!, this.deck.pop()!);
    else this.community.push(this.deck.pop()!);

    // ¿Queda alguien que pueda apostar? Si no (todos all-in), corre el resto.
    const canStillBet = this.contenders().filter((p) => !p.allIn);
    if (canStillBet.length <= 1) {
      if (this.street === "river") {
        this.showdown();
      } else {
        this.advanceStreet(); // sigue repartiendo hasta el river y showdown
      }
      return;
    }
    this.toAct = this.nextSeat(this.button, (p) => this.canAct(p));
    this.notify();
  }

  // --- Resolución --------------------------------------------------------

  private award(userId: string, amount: number) {
    const p = this.players.find((x) => x.userId === userId);
    if (p) p.chips += amount;
  }

  private awardFoldWin(winner: PokerPlayer) {
    const pot = this.players.reduce((s, p) => s + p.totalBet, 0);
    winner.chips += pot;
    this.lastShowdown = [{ id: winner.userId, name: winner.name, amount: pot }];
    this.endHand();
  }

  private showdown() {
    const contributions = new Map<string, number>();
    const folded = new Set<string>();
    for (const p of this.players) {
      if (p.inHand && p.totalBet > 0) contributions.set(p.userId, p.totalBet);
      if (p.inHand && p.folded) folded.add(p.userId);
    }
    const pots = computeSidePots(contributions, folded);

    const wonBy = new Map<string, number>();
    for (const pot of pots) {
      const eligible = pot.eligible
        .map((id) => this.players.find((p) => p.userId === id))
        .filter((p): p is PokerPlayer => !!p && !p.folded);
      if (eligible.length === 0) continue;
      const winners = winnersAmong(
        eligible.map((p) => ({ id: p.userId, hole: p.hole })),
        this.community,
      );
      const share = Math.floor(pot.amount / winners.length);
      let remainder = pot.amount - share * winners.length;
      for (const id of winners) {
        const amount = share + (remainder > 0 ? 1 : 0);
        if (remainder > 0) remainder--;
        this.award(id, amount);
        wonBy.set(id, (wonBy.get(id) ?? 0) + amount);
      }
    }

    this.lastShowdown = this.contenders().map((p) => ({
      id: p.userId,
      name: p.name,
      amount: wonBy.get(p.userId) ?? 0,
      hand: handName(p.hole, this.community),
      hole: p.hole,
    }));
    this.endHand();
  }

  private endHand() {
    this.handActive = false;
    this.street = "idle";
    this.toAct = -1;
    // Saca a quien se está retirando (ya cobró su stack).
    for (const p of [...this.players]) if (p.leaving) this.removePlayer(p.userId);
    this.phase = "waiting";
    this.notify();
    this.syncTurnTimer(); // mano terminada -> limpia el contador
    this.maybeStartHand();
  }

  // --- Temporizador de turno ---------------------------------------------

  // (Re)arma el contador para quien deba actuar. Al agotarse, actúa el servidor.
  private syncTurnTimer() {
    if (this.turnTimer) {
      clearTimeout(this.turnTimer);
      this.turnTimer = null;
    }
    if (this.handActive && this.toAct >= 0 && this.turnTimeoutMs > 0) {
      this.turnDeadline = Date.now() + this.turnTimeoutMs;
      this.turnTimer = setTimeout(() => this.onTurnTimeout(), this.turnTimeoutMs);
      this.turnTimer.unref?.(); // no mantener vivo el proceso por este timer
    } else {
      this.turnDeadline = null;
    }
  }

  // Al agotarse el turno: pasa si puede (no hay apuesta que igualar), si no, se retira.
  private onTurnTimeout() {
    if (!this.handActive || this.toAct < 0) return;
    const seat = this.toAct;
    const p = this.players[seat];
    if (!p) return;
    const callAmount = this.currentBet - p.roundBet;
    try {
      if (callAmount === 0) this.act(seat, { kind: "check" });
      else this.act(seat, { kind: "fold" });
    } catch {
      /* si el estado cambió en el ínterin, lo ignoramos */
    }
    this.syncTurnTimer();
  }

  // --- Estado por jugador ------------------------------------------------

  publicState(_table: Table, forUserId: string): unknown {
    const meSeat = this.players.findIndex((p) => p.userId === forUserId);
    const me = this.players[meSeat];
    const pot = this.players.reduce((s, p) => s + p.totalBet, 0);
    const reveal = !this.handActive && this.lastShowdown.some((s) => s.hole); // showdown visible

    const seats = this.players.map((p, seat) => ({
      id: p.userId,
      name: p.name,
      chips: p.chips,
      roundBet: p.roundBet,
      folded: p.folded,
      allIn: p.allIn,
      inHand: p.inHand,
      isButton: seat === this.button,
      isTurn: this.handActive && seat === this.toAct,
      hole:
        p.userId === forUserId
          ? p.hole
          : reveal && !p.folded && this.lastShowdown.find((s) => s.id === p.userId)?.hole
            ? p.hole
            : null,
    }));

    let actions: Record<string, unknown> | null = null;
    if (me && this.handActive && this.toAct === meSeat) {
      const callAmount = this.currentBet - me.roundBet;
      actions = {
        canFold: true,
        canCheck: callAmount === 0,
        canCall: callAmount > 0 && me.chips > 0,
        callAmount: Math.min(callAmount, me.chips),
        canRaise: me.chips > callAmount,
        minRaiseTo: Math.min(this.currentBet + this.minRaise, me.roundBet + me.chips),
        maxRaiseTo: me.roundBet + me.chips,
      };
    }

    return {
      phase: this.phase,
      handActive: this.handActive,
      street: this.street,
      community: this.community,
      pot,
      currentBet: this.currentBet,
      buyIn: this.buyIn,
      smallBlind: this.smallBlind,
      bigBlind: this.bigBlind,
      button: this.button,
      toActUserId: this.handActive && this.toAct >= 0 ? this.players[this.toAct]?.userId : null,
      seats,
      mySeat: meSeat,
      myChips: me?.chips ?? 0,
      myHole: me?.hole ?? [],
      myTurn: !!me && this.handActive && this.toAct === meSeat,
      actions,
      showdown: this.lastShowdown,
      seatsMax: this.maxPlayers,
      turnEndsAt: this.handActive ? this.turnDeadline : null,
      turnTimeoutMs: this.turnTimeoutMs,
    };
  }
}
