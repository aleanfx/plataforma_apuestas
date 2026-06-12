import type { Prisma, LedgerType } from "@prisma/client";
import { badRequest } from "../errors.js";

// Primitiva atómica del dinero. TODO movimiento de saldo pasa por aquí, siempre
// dentro de una transacción (`tx`) para que el LedgerEntry y el cambio de balance
// no puedan divergir. El débito usa un updateMany condicional (balance >= monto)
// que es atómico a nivel de fila y previene sobregiros aun con concurrencia.
export async function applyLedger(
  tx: Prisma.TransactionClient,
  input: {
    accountId: string;
    userId: string;
    delta: bigint; // +acredita / -debita, en céntimos
    type: LedgerType;
    refId?: string;
    note?: string;
  },
) {
  const { accountId, userId, delta, type, refId, note } = input;

  if (delta < 0n) {
    const debit = -delta;
    const res = await tx.account.updateMany({
      where: { id: accountId, balance: { gte: debit } },
      data: { balance: { decrement: debit } },
    });
    if (res.count === 0) throw badRequest("Saldo insuficiente");
  } else if (delta > 0n) {
    await tx.account.update({
      where: { id: accountId },
      data: { balance: { increment: delta } },
    });
  }

  await tx.ledgerEntry.create({
    data: { accountId, userId, delta, type, refId, note },
  });
}
