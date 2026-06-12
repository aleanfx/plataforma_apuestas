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
