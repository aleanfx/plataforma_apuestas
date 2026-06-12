import type { NextFunction, Request, Response } from "express";
import { ZodError, type ZodSchema } from "zod";
import { AppError } from "./errors.js";

// Envuelve un handler async para que los throws lleguen al error handler.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

// Valida req.body contra un schema zod y devuelve el dato tipado.
export function parseBody<T>(schema: ZodSchema<T>, body: unknown): T {
  return schema.parse(body);
}

// Error handler global de Express (se monta al final).
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    const msg = err.errors[0]?.message ?? "Datos inválidos";
    return res.status(400).json({ error: msg });
  }
  if (err instanceof AppError) {
    return res.status(err.status).json({ error: err.message });
  }
  console.error("Error no manejado:", err);
  return res.status(500).json({ error: "Error interno del servidor" });
}
