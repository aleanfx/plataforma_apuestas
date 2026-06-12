import { prisma } from "../db.js";
import { badRequest, notFound } from "../errors.js";

// Métricas globales para el panel admin. Montos en céntimos.
export async function getMetrics() {
  const [users, pendingDep, pendingWd, balAgg, depAgg, wdAgg] = await Promise.all([
    prisma.user.count(),
    prisma.depositRequest.count({ where: { status: "pending" } }),
    prisma.withdrawRequest.count({ where: { status: "pending" } }),
    prisma.account.aggregate({ _sum: { balance: true } }),
    prisma.depositRequest.aggregate({ _sum: { amount: true }, where: { status: "approved" } }),
    prisma.withdrawRequest.aggregate({ _sum: { amount: true }, where: { status: "approved" } }),
  ]);
  return {
    users,
    pendingDeposits: pendingDep,
    pendingWithdrawals: pendingWd,
    balanceTotal: Number(balAgg._sum.balance ?? 0n),
    depositsTotal: Number(depAgg._sum.amount ?? 0n),
    withdrawalsTotal: Number(wdAgg._sum.amount ?? 0n),
  };
}

export async function listUsers() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { account: true },
  });
  return users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    status: u.status,
    balance: Number(u.account?.balance ?? 0n),
    createdAt: u.createdAt.toISOString(),
  }));
}

export async function setUserStatus(userId: string, status: "active" | "suspended") {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw notFound("Usuario no encontrado");
  if (user.role === "admin") throw badRequest("No puedes cambiar el estado de un administrador");
  await prisma.user.update({ where: { id: userId }, data: { status } });
}
