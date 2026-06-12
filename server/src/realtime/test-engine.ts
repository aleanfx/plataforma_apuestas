import type { GameEngine, GameAction } from "./engine.js";
import type { Table } from "./hub.js";
import type { SocketUser } from "./auth.js";
import { chargeStake, payout } from "./escrow.js";

// Motor trivial SOLO para pruebas del núcleo de tiempo real (Módulo 3).
// No se usa en producción (lo instancia únicamente el endpoint /dev/test-table).
export class CounterEngine implements GameEngine {
  readonly game = "bingo" as const; // reutiliza el enum; es solo para tests
  readonly maxPlayers = 4;

  canJoin(table: Table): { ok: boolean; reason?: string } {
    if (table.status === "finished") return { ok: false, reason: "Mesa terminada" };
    return { ok: true };
  }

  onJoin(table: Table): void {
    if (typeof table.state.count !== "number") table.state.count = 0;
  }

  onLeave(): void {}

  async onAction(table: Table, user: SocketUser, action: GameAction): Promise<void> {
    switch (action.type) {
      case "increment":
        table.state.count = ((table.state.count as number) ?? 0) + 1;
        break;
      case "charge":
        await chargeStake(user.id, table.stake, table.id);
        break;
      case "payout":
        await payout(user.id, table.stake, table.id);
        break;
      default:
        throw new Error("Acción desconocida");
    }
  }

  publicState(table: Table, forUserId: string): unknown {
    return { count: (table.state.count as number) ?? 0, you: forUserId };
  }
}
