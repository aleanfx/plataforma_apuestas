import { prisma } from "../db.js";
import { notFound } from "../errors.js";
import { applyLedger } from "../wallet/ledger.js";

// Escrow: el dinero de las apuestas entra y sale SIEMPRE por el ledger, atómico.
// Lo usan los juegos (Bingo/Dominó/Póker) al cobrar la apuesta y al pagar el pozo.

/** Cobra una apuesta/buy-in. Debita el saldo de forma atómica (lanza si no alcanza).
 *  Devuelve true si se cobró. `refId` = id de mesa/ronda para auditoría. */
export async function chargeStake(userId: string, amountCents: number, refId: string): Promise<void> {
  if (amountCents <= 0) return;
  await prisma.$transaction(async (tx) => {
    const acc = await tx.account.findUnique({ where: { userId } });
    if (!acc) throw notFound("Cuenta no encontrada");
    await applyLedger(tx, {
      accountId: acc.id,
      userId,
      delta: -BigInt(amountCents),
      type: "bet_stake",
      refId,
      note: "Apuesta",
    });
  });
}

/** Paga un premio/pozo (crédito). `refId` = id de ronda. */
export async function payout(userId: string, amountCents: number, refId: string, note = "Premio"): Promise<void> {
  if (amountCents <= 0) return;
  await prisma.$transaction(async (tx) => {
    const acc = await tx.account.findUnique({ where: { userId } });
    if (!acc) throw notFound("Cuenta no encontrada");
    await applyLedger(tx, {
      accountId: acc.id,
      userId,
      delta: BigInt(amountCents),
      type: "bet_payout",
      refId,
      note,
    });
  });
}

/** Reintegra una apuesta (p. ej. mesa cancelada antes de empezar). */
export async function refundStake(userId: string, amountCents: number, refId: string): Promise<void> {
  if (amountCents <= 0) return;
  await prisma.$transaction(async (tx) => {
    const acc = await tx.account.findUnique({ where: { userId } });
    if (!acc) throw notFound("Cuenta no encontrada");
    await applyLedger(tx, {
      accountId: acc.id,
      userId,
      delta: BigInt(amountCents),
      type: "bet_payout",
      refId,
      note: "Reintegro de apuesta",
    });
  });
}

/** Saldo disponible (céntimos) de un usuario. */
export async function balanceOf(userId: string): Promise<number> {
  const acc = await prisma.account.findUnique({ where: { userId } });
  return acc ? Number(acc.balance) : 0;
}

// --- Escrow inyectable -------------------------------------------------------
// Los motores reciben un `Escrow`; el real mueve dinero por el ledger. El de
// práctica (modo "Practicar vs CPU") es un no-op con saldo infinito: nada toca
// la billetera real ni la base de datos. Así los bots y el jugador practican con
// dinero de juguete.

export interface Escrow {
  chargeStake(userId: string, amountCents: number, refId: string): Promise<void>;
  payout(userId: string, amountCents: number, refId: string, note?: string): Promise<void>;
  refundStake(userId: string, amountCents: number, refId: string): Promise<void>;
  balanceOf(userId: string): Promise<number>;
}

/** Escrow real: el dinero entra/sale por el ledger (producción). */
export const realEscrow: Escrow = { chargeStake, payout, refundStake, balanceOf };

/** Escrow de práctica: no mueve dinero. Saldo "infinito" para que pasen los checks. */
export const practiceEscrow: Escrow = {
  async chargeStake() {},
  async payout() {},
  async refundStake() {},
  async balanceOf() {
    return Number.MAX_SAFE_INTEGER;
  },
};
