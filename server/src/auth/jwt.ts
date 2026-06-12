import crypto from "node:crypto";
import jwt from "jsonwebtoken";
import { env } from "../env.js";

export type AccessPayload = { sub: string; role: "user" | "admin" };

const ACCESS_TTL = "7d"; // token de acceso (corto-medio para un MVP)
const REFRESH_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 días

export function signAccess(payload: AccessPayload): string {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: ACCESS_TTL });
}

export function verifyAccess(token: string): AccessPayload {
  return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessPayload;
}

/** Genera un refresh token opaco y su hash (lo que se guarda en la DB). */
export function newRefreshToken() {
  const token = crypto.randomBytes(48).toString("hex");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TTL_MS);
  return { token, tokenHash, expiresAt };
}

export function hashToken(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}
