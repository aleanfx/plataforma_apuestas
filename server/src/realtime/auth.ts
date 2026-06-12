import type { Socket } from "socket.io";
import { prisma } from "../db.js";
import { verifyAccess } from "../auth/jwt.js";

export type SocketUser = { id: string; name: string; role: "user" | "admin" };

// Middleware de Socket.IO: valida el JWT del handshake y adjunta el usuario.
// El cliente lo manda en `auth: { token }` (ver vegasve/lib/socket.ts).
export async function socketAuth(socket: Socket, next: (err?: Error) => void) {
  try {
    const token = (socket.handshake.auth?.token as string | undefined) ?? undefined;
    if (!token) return next(new Error("No autenticado"));

    const payload = verifyAccess(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, name: true, role: true, status: true },
    });
    if (!user || user.status === "suspended") return next(new Error("Sesión inválida"));

    (socket.data as { user: SocketUser }).user = {
      id: user.id,
      name: user.name,
      role: user.role,
    };
    next();
  } catch {
    next(new Error("Sesión inválida o expirada"));
  }
}

/** Atajo para leer el usuario autenticado de un socket. */
export function userOf(socket: Socket): SocketUser {
  return (socket.data as { user: SocketUser }).user;
}
