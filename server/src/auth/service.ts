import type { Account, User } from "@prisma/client";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { conflict, unauthorized, forbidden } from "../errors.js";
import { hashPassword, verifyPassword } from "./password.js";
import { signAccess, newRefreshToken, hashToken } from "./jwt.js";

// Forma pública del usuario que se envía al frontend (sin passwordHash).
export type PublicUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin";
  balance: number; // céntimos
  bonus: number; // céntimos
  locked: number; // céntimos
};

export function toPublicUser(user: User, account: Account): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    balance: Number(account.balance),
    bonus: Number(account.bonus),
    locked: Number(account.locked),
  };
}

async function issueSession(userId: string, role: "user" | "admin") {
  const access = signAccess({ sub: userId, role });
  const { token, tokenHash, expiresAt } = newRefreshToken();
  await prisma.refreshToken.create({ data: { userId, tokenHash, expiresAt } });
  return { access, refresh: token };
}

export async function register(input: { email: string; name: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw conflict("Ese correo ya está registrado");

  const passwordHash = await hashPassword(input.password);
  const role = email === env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user";

  const user = await prisma.user.create({
    data: {
      email,
      name: input.name.trim(),
      passwordHash,
      role,
      account: { create: {} }, // saldo en cero
    },
    include: { account: true },
  });

  const session = await issueSession(user.id, role);
  return { user: toPublicUser(user, user.account!), ...session };
}

export async function login(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const user = await prisma.user.findUnique({ where: { email }, include: { account: true } });
  if (!user || !user.account) throw unauthorized("Correo o contraseña incorrectos");
  if (user.status === "suspended") throw forbidden("Tu cuenta está suspendida");

  const ok = await verifyPassword(input.password, user.passwordHash);
  if (!ok) throw unauthorized("Correo o contraseña incorrectos");

  const session = await issueSession(user.id, user.role);
  return { user: toPublicUser(user, user.account), ...session };
}

export async function refresh(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!record || record.revokedAt || record.expiresAt < new Date()) {
    throw unauthorized("Sesión expirada, vuelve a iniciar sesión");
  }
  const user = await prisma.user.findUnique({
    where: { id: record.userId },
    include: { account: true },
  });
  if (!user || !user.account || user.status === "suspended") {
    throw unauthorized("Sesión inválida");
  }

  // Rotación: revoca el refresh usado y emite uno nuevo.
  await prisma.refreshToken.update({
    where: { id: record.id },
    data: { revokedAt: new Date() },
  });
  const session = await issueSession(user.id, user.role);
  return { user: toPublicUser(user, user.account), ...session };
}

export async function logout(refreshToken: string) {
  const tokenHash = hashToken(refreshToken);
  await prisma.refreshToken.updateMany({
    where: { tokenHash, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}

export async function getMe(userId: string): Promise<PublicUser> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { account: true },
  });
  if (!user || !user.account) throw unauthorized("Sesión inválida");
  return toPublicUser(user, user.account);
}
