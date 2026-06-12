import type { NextFunction, Request, Response } from "express";
import { verifyAccess, type AccessPayload } from "./jwt.js";

// Request con el usuario autenticado adjunto.
export interface AuthedRequest extends Request {
  user?: AccessPayload;
}

/** Exige un bearer token válido. Adjunta req.user. */
export function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No autenticado" });
  }
  try {
    req.user = verifyAccess(header.slice(7));
    next();
  } catch {
    return res.status(401).json({ error: "Sesión inválida o expirada" });
  }
}

/** Exige rol admin (debe ir después de requireAuth). */
export function requireAdmin(req: AuthedRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ error: "Acceso solo para administradores" });
  }
  next();
}
