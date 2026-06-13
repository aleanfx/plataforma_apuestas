import type { Server, Socket } from "socket.io";
import type { GameKind } from "@prisma/client";
import type { GameEngine, GameAction } from "./engine.js";
import type { SocketUser } from "./auth.js";
import { userOf } from "./auth.js";

export type Member = {
  id: string;
  name: string;
  connected: boolean;
  joinedAt: number;
  bot?: boolean; // jugador CPU (modo práctica): no tiene socket
};

/** Controlador de bots de una mesa de práctica (lo implementa BotController). */
export interface TableBots {
  onState(): void;
  destroy(): void;
}

export interface Table {
  id: string;
  game: GameKind;
  name: string;
  stake: number; // céntimos
  maxPlayers: number;
  status: "waiting" | "playing" | "finished";
  members: Map<string, Member>; // userId -> miembro
  engine: GameEngine;
  state: Record<string, unknown>; // estado interno del juego (lo maneja el motor)
  roundId?: string;
  practice?: boolean; // mesa "Practicar vs CPU": dinero de juguete, se destruye al irse el humano
  bots?: TableBots; // controlador de los jugadores CPU
}

function roomOf(tableId: string) {
  return `table:${tableId}`;
}

// El Hub es el núcleo de tiempo real: gestiona mesas en memoria, membresía,
// presencia y reconexión. Es genérico; cada juego aporta su `GameEngine`.
export class Hub {
  private tables = new Map<string, Table>();
  private userSockets = new Map<string, Set<string>>(); // userId -> socketIds

  constructor(private io: Server) {}

  // --- Mesas -------------------------------------------------------------

  createTable(opts: { id: string; name: string; stake: number; engine: GameEngine; roundId?: string }): Table {
    const table: Table = {
      id: opts.id,
      game: opts.engine.game,
      name: opts.name,
      stake: opts.stake,
      maxPlayers: opts.engine.maxPlayers,
      status: "waiting",
      members: new Map(),
      engine: opts.engine,
      state: {},
      roundId: opts.roundId,
    };
    this.tables.set(table.id, table);
    return table;
  }

  getTable(id: string): Table | undefined {
    return this.tables.get(id);
  }

  removeTable(id: string) {
    const table = this.tables.get(id);
    if (table) {
      table.bots?.destroy();
      table.engine.dispose?.();
    }
    this.tables.delete(id);
  }

  /** Añade un jugador CPU a una mesa de práctica (sin socket). */
  addBot(table: Table, bot: { id: string; name: string }) {
    table.members.set(bot.id, {
      id: bot.id,
      name: bot.name,
      connected: true,
      joinedAt: Date.now(),
      bot: true,
    });
    void table.engine.onJoin(table, bot as SocketUser);
  }

  /** ¿Queda algún humano (no-bot) conectado en la mesa? */
  private hasConnectedHuman(table: Table): boolean {
    for (const m of table.members.values()) if (!m.bot && m.connected) return true;
    return false;
  }

  /** Destruye una mesa de práctica si ya no le quedan humanos. */
  private cleanupPractice(table: Table) {
    if (!table.practice) return;
    const anyHuman = [...table.members.values()].some((m) => !m.bot);
    if (!anyHuman || !this.hasConnectedHuman(table)) this.removeTable(table.id);
  }

  listTables(game?: GameKind) {
    return [...this.tables.values()]
      .filter((t) => !game || t.game === game)
      .map((t) => ({
        id: t.id,
        game: t.game,
        name: t.name,
        stake: t.stake,
        players: t.members.size,
        maxPlayers: t.maxPlayers,
        status: t.status,
      }));
  }

  // --- Presencia / sockets ----------------------------------------------

  private trackSocket(userId: string, socketId: string) {
    let set = this.userSockets.get(userId);
    if (!set) {
      set = new Set();
      this.userSockets.set(userId, set);
    }
    set.add(socketId);
  }

  private untrackSocket(userId: string, socketId: string): boolean {
    const set = this.userSockets.get(userId);
    if (!set) return false;
    set.delete(socketId);
    if (set.size === 0) {
      this.userSockets.delete(userId);
      return true; // ya no le quedan sockets (offline)
    }
    return false;
  }

  private socketsOf(userId: string): string[] {
    return [...(this.userSockets.get(userId) ?? [])];
  }

  /** Cantidad de usuarios con al menos un socket conectado (para métricas admin). */
  onlineCount(): number {
    return this.userSockets.size;
  }

  // --- Conexión / desconexión -------------------------------------------

  handleConnection(socket: Socket) {
    const user = userOf(socket);
    this.trackSocket(user.id, socket.id);

    // Reconexión: avísale qué mesas ya tiene para que el cliente re-entre.
    const mine = [...this.tables.values()]
      .filter((t) => t.members.has(user.id))
      .map((t) => t.id);
    if (mine.length) socket.emit("table:rejoinable", { tableIds: mine });
  }

  handleDisconnect(socket: Socket) {
    const user = userOf(socket);
    const offline = this.untrackSocket(user.id, socket.id);
    if (!offline) return; // aún tiene otra pestaña abierta

    // Marca presencia offline en sus mesas y avisa (el seat se conserva).
    for (const table of this.tables.values()) {
      const m = table.members.get(user.id);
      if (m) {
        m.connected = false;
        this.broadcast(table);
        this.cleanupPractice(table); // si era práctica y se fue el humano, se destruye
      }
    }
  }

  // --- Unirse / salir ----------------------------------------------------

  join(socket: Socket, tableId: string): { ok: boolean; reason?: string } {
    const user = userOf(socket);
    const table = this.tables.get(tableId);
    if (!table) return { ok: false, reason: "La mesa no existe" };

    const existing = table.members.get(user.id);
    if (existing) {
      // Reconexión: vuelve a la sala y márcalo conectado.
      existing.connected = true;
      socket.join(roomOf(tableId));
      this.sendState(table, user.id);
      this.broadcast(table);
      table.bots?.onState(); // reanuda a los CPU si toca
      return { ok: true };
    }

    if (table.members.size >= table.maxPlayers) return { ok: false, reason: "Mesa llena" };
    const can = table.engine.canJoin(table, user);
    if (!can.ok) return { ok: false, reason: can.reason };

    table.members.set(user.id, { id: user.id, name: user.name, connected: true, joinedAt: Date.now() });
    socket.join(roomOf(tableId));
    void table.engine.onJoin(table, user);
    this.broadcast(table);
    table.bots?.onState(); // arranca a los CPU (comprar/sentarse) ahora que hay humano
    return { ok: true };
  }

  leave(socket: Socket, tableId: string) {
    const user = userOf(socket);
    const table = this.tables.get(tableId);
    if (!table) return;
    if (!table.members.has(user.id)) return;

    table.members.delete(user.id);
    socket.leave(roomOf(tableId));
    void table.engine.onLeave(table, user.id);
    this.broadcast(table);
    this.cleanupPractice(table); // mesa de práctica sin humanos -> se destruye
  }

  async action(socket: Socket, tableId: string, action: GameAction): Promise<{ ok: boolean; reason?: string }> {
    const user = userOf(socket);
    const table = this.tables.get(tableId);
    if (!table) return { ok: false, reason: "La mesa no existe" };
    if (!table.members.has(user.id)) return { ok: false, reason: "No estás en esta mesa" };
    try {
      await table.engine.onAction(table, user, action);
      this.broadcast(table);
      return { ok: true };
    } catch (err) {
      return { ok: false, reason: err instanceof Error ? err.message : "Acción inválida" };
    }
  }

  // --- Difusión de estado ------------------------------------------------

  /** Envía a cada miembro conectado su vista personalizada del estado. */
  broadcast(table: Table) {
    for (const member of table.members.values()) {
      if (!member.connected) continue;
      this.sendState(table, member.id);
    }
  }

  /** Envía el estado a un usuario concreto (a todos sus sockets). */
  sendState(table: Table, userId: string) {
    const payload = {
      table: {
        id: table.id,
        game: table.game,
        name: table.name,
        stake: table.stake,
        maxPlayers: table.maxPlayers,
        status: table.status,
        members: [...table.members.values()].map((m) => ({
          id: m.id,
          name: m.name,
          connected: m.connected,
        })),
      },
      game: table.engine.publicState(table, userId),
    };
    for (const sid of this.socketsOf(userId)) {
      this.io.to(sid).emit("table:state", payload);
    }
  }
}
