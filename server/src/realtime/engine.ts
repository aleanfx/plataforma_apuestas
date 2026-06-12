import type { GameKind } from "@prisma/client";
import type { SocketUser } from "./auth.js";
import type { Table } from "./hub.js";

export type GameAction = { type: string; [k: string]: unknown };

// Contrato que implementa cada juego (Bingo/Dominó/Póker). El Hub es genérico y
// delega en el motor toda la lógica específica del juego. La autoridad es siempre
// el servidor: el motor valida cada acción y decide el estado.
export interface GameEngine {
  readonly game: GameKind;
  readonly maxPlayers: number;

  /** ¿Puede este usuario unirse a la mesa? (asientos, estado, saldo…) */
  canJoin(table: Table, user: SocketUser): { ok: boolean; reason?: string };

  /** Se llama tras añadir al usuario a la mesa. */
  onJoin(table: Table, user: SocketUser): void | Promise<void>;

  /** Se llama tras quitar al usuario de la mesa. */
  onLeave(table: Table, userId: string): void | Promise<void>;

  /** Acción del juego (jugar ficha, cantar número, apostar, comprar cartón…). */
  onAction(table: Table, user: SocketUser, action: GameAction): void | Promise<void>;

  /** Estado que ve un jugador concreto (puede ocultar info privada por `forUserId`). */
  publicState(table: Table, forUserId: string): unknown;
}
