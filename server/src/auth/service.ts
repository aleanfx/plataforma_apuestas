import crypto from "node:crypto";
import { OAuth2Client } from "google-auth-library";
import type { Account, User } from "@prisma/client";
import { prisma } from "../db.js";
import { env } from "../env.js";
import { conflict, unauthorized, forbidden, badRequest } from "../errors.js";
import { hashPassword, verifyPassword } from "./password.js";
import { signAccess, newRefreshToken, hashToken } from "./jwt.js";

// Forma pública del usuario que se envía al frontend (sin passwordHash).
export type PublicUser = {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  role: "user" | "admin";
  balance: number; // céntimos
  bonus: number; // céntimos
  locked: number; // céntimos
  currency: string | null; // VES | USD | COP
};

export function toPublicUser(user: User, account: Account): PublicUser {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    avatarUrl: user.avatarUrl ?? null,
    role: user.role,
    balance: Number(account.balance),
    bonus: Number(account.bonus),
    locked: Number(account.locked),
    currency: user.currency ?? null,
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

// --- Login con Google (OAuth) ----------------------------------------------

let googleClient: OAuth2Client | null = null;
function getGoogleClient(): OAuth2Client | null {
  if (!env.GOOGLE_CLIENT_ID) return null;
  if (!googleClient) googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);
  return googleClient;
}

/** Verifica el credential (ID token) de Google y crea/recupera la cuenta. */
export async function loginWithGoogle(credential: string) {
  const client = getGoogleClient();
  if (!client || !env.GOOGLE_CLIENT_ID) throw badRequest("El acceso con Google no está configurado");

  let payload;
  try {
    const ticket = await client.verifyIdToken({ idToken: credential, audience: env.GOOGLE_CLIENT_ID });
    payload = ticket.getPayload();
  } catch {
    throw unauthorized("No se pudo verificar la cuenta de Google");
  }
  if (!payload?.email || !payload.email_verified) {
    throw unauthorized("La cuenta de Google no tiene un correo verificado");
  }

  const email = payload.email.trim().toLowerCase();
  const name = payload.name?.trim() || email.split("@")[0];
  const picture = payload.picture ?? null;

  let user = await prisma.user.findUnique({ where: { email }, include: { account: true } });
  if (!user) {
    const role = email === env.ADMIN_EMAIL.toLowerCase() ? "admin" : "user";
    // Sin contraseña usable: se genera un hash aleatorio (sólo entra por Google).
    const passwordHash = await hashPassword(crypto.randomBytes(32).toString("hex"));
    user = await prisma.user.create({
      data: { email, name, passwordHash, role, avatarUrl: picture, account: { create: {} } },
      include: { account: true },
    });
  } else {
    if (user.status === "suspended") throw forbidden("Tu cuenta está suspendida");
    if (!user.avatarUrl && picture) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl: picture },
        include: { account: true },
      });
    }
  }

  const session = await issueSession(user.id, user.role);
  return { user: toPublicUser(user, user.account!), ...session };
}

// --- Foto de perfil --------------------------------------------------------

/** Actualiza la foto de perfil (data URL de imagen, pequeña). */
export async function updateAvatar(userId: string, avatarUrl: string): Promise<PublicUser> {
  if (!/^data:image\/(png|jpeg|jpg|webp);base64,/.test(avatarUrl)) {
    throw badRequest("Formato de imagen no válido");
  }
  if (avatarUrl.length > 90_000) throw badRequest("La imagen es muy grande; usa una más pequeña");
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatarUrl },
    include: { account: true },
  });
  if (!user.account) throw unauthorized("Sesión inválida");
  return toPublicUser(user, user.account);
}

/** Cambia la contraseña del usuario (verifica la actual). */
export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw unauthorized("Sesión inválida");
  const ok = await verifyPassword(currentPassword, user.passwordHash);
  if (!ok) throw badRequest("La contraseña actual no es correcta");
  if (currentPassword === newPassword) {
    throw badRequest("La nueva contraseña debe ser distinta a la actual");
  }
  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
}

/** Actualiza la moneda preferida del usuario. */
export async function updateCurrency(userId: string, currency: string): Promise<PublicUser> {
  if (!["VES", "USD", "COP"].includes(currency)) {
    throw badRequest("Moneda no soportada");
  }
  const user = await prisma.user.update({
    where: { id: userId },
    data: { currency },
    include: { account: true },
  });
  if (!user.account) throw unauthorized("Sesión inválida");
  return toPublicUser(user, user.account);
}

