import { prisma } from "../db.js";
import { badRequest, notFound, conflict } from "../errors.js";
import { applyLedger } from "./ledger.js";

export const PAYMENT_METHODS = ["nowpayments", "binance", "pagomovil", "daviplata", "nequi"] as const;
export type PaymentMethod = (typeof PAYMENT_METHODS)[number];

const MIN_CENTS = 1000; // Bs. 10

async function accountIdOf(userId: string): Promise<string> {
  const acc = await prisma.account.findUnique({ where: { userId } });
  if (!acc) throw notFound("Cuenta no encontrada");
  return acc.id;
}

// --- Solicitudes del usuario ---------------------------------------------

/** Crea una solicitud de depósito (queda PENDIENTE; no acredita hasta que un admin aprueba). */
export async function createDeposit(
  userId: string,
  input: { method: PaymentMethod; amount: number; reference?: string },
) {
  if (input.amount < MIN_CENTS) throw badRequest("El monto mínimo es Bs. 10");
  return prisma.depositRequest.create({
    data: {
      userId,
      method: input.method,
      amount: BigInt(input.amount),
      reference: input.reference,
    },
  });
}

/** Crea una solicitud de retiro. Debita el saldo de inmediato (retención) de forma
 *  atómica: si no hay saldo, no se crea la solicitud. Se reintegra si se rechaza. */
export async function createWithdraw(
  userId: string,
  input: { method: PaymentMethod; amount: number; destination: string },
) {
  if (input.amount < MIN_CENTS) throw badRequest("El monto mínimo es Bs. 10");
  const accountId = await accountIdOf(userId);

  return prisma.$transaction(async (tx) => {
    const req = await tx.withdrawRequest.create({
      data: {
        userId,
        method: input.method,
        amount: BigInt(input.amount),
        destination: input.destination,
      },
    });
    // Débito con retención (lanza "Saldo insuficiente" y revierte si no alcanza).
    await applyLedger(tx, {
      accountId,
      userId,
      delta: -BigInt(input.amount),
      type: "withdraw",
      refId: req.id,
      note: "Retiro solicitado",
    });
    return req;
  });
}

// --- Aprobaciones del admin ----------------------------------------------

export async function approveDeposit(requestId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.depositRequest.findUnique({ where: { id: requestId } });
    if (!req) throw notFound("Solicitud no encontrada");
    if (req.status !== "pending") throw conflict("La solicitud ya fue procesada");

    const acc = await tx.account.findUnique({ where: { userId: req.userId } });
    if (!acc) throw notFound("Cuenta no encontrada");

    await applyLedger(tx, {
      accountId: acc.id,
      userId: req.userId,
      delta: req.amount, // crédito
      type: "deposit",
      refId: req.id,
      note: "Depósito aprobado",
    });
    return tx.depositRequest.update({
      where: { id: requestId },
      data: { status: "approved", reviewedBy: adminId, reviewedAt: new Date() },
    });
  });
}

export async function rejectDeposit(requestId: string, adminId: string) {
  // El depósito nunca se acreditó, así que solo se marca rechazado.
  const res = await prisma.depositRequest.updateMany({
    where: { id: requestId, status: "pending" },
    data: { status: "rejected", reviewedBy: adminId, reviewedAt: new Date() },
  });
  if (res.count === 0) throw conflict("La solicitud ya fue procesada o no existe");
}

export async function approveWithdraw(requestId: string, adminId: string) {
  // El saldo ya se debitó al solicitar; aprobar solo lo marca como pagado.
  const res = await prisma.withdrawRequest.updateMany({
    where: { id: requestId, status: "pending" },
    data: { status: "approved", reviewedBy: adminId, reviewedAt: new Date() },
  });
  if (res.count === 0) throw conflict("La solicitud ya fue procesada o no existe");
}

export async function rejectWithdraw(requestId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    const req = await tx.withdrawRequest.findUnique({ where: { id: requestId } });
    if (!req) throw notFound("Solicitud no encontrada");
    if (req.status !== "pending") throw conflict("La solicitud ya fue procesada");

    const acc = await tx.account.findUnique({ where: { userId: req.userId } });
    if (!acc) throw notFound("Cuenta no encontrada");

    // Reintegra el monto retenido al saldo.
    await applyLedger(tx, {
      accountId: acc.id,
      userId: req.userId,
      delta: req.amount,
      type: "adjust",
      refId: req.id,
      note: "Reintegro por retiro rechazado",
    });
    return tx.withdrawRequest.update({
      where: { id: requestId },
      data: { status: "rejected", reviewedBy: adminId, reviewedAt: new Date() },
    });
  });
}

// --- Consultas -----------------------------------------------------------

export type TxDTO = {
  id: string;
  type: string;
  delta: number; // céntimos (con signo)
  note: string | null;
  createdAt: string;
};

/** Historial de movimientos del usuario (entradas del ledger ya liquidadas). */
export async function getTransactions(userId: string): Promise<TxDTO[]> {
  const entries = await prisma.ledgerEntry.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  return entries.map((e) => ({
    id: e.id,
    type: e.type,
    delta: Number(e.delta),
    note: e.note,
    createdAt: e.createdAt.toISOString(),
  }));
}

/** Cola de solicitudes pendientes para el panel admin. */
export async function getPendingRequests() {
  const [deposits, withdrawals] = await Promise.all([
    prisma.depositRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, email: true } } },
    }),
    prisma.withdrawRequest.findMany({
      where: { status: "pending" },
      orderBy: { createdAt: "asc" },
      include: { user: { select: { name: true, email: true } } },
    }),
  ]);

  const map = (r: { id: string; method: string; amount: bigint; createdAt: Date; user: { name: string; email: string } }, kind: "deposit" | "withdraw") => ({
    id: r.id,
    kind,
    method: r.method,
    amount: Number(r.amount),
    userName: r.user.name,
    userEmail: r.user.email,
    createdAt: r.createdAt.toISOString(),
  });

  return [
    ...deposits.map((d) => map(d, "deposit")),
    ...withdrawals.map((w) => map(w, "withdraw")),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}
