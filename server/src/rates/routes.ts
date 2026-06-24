import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBody } from "../http.js";
import { requireAuth, requireAdmin } from "../auth/middleware.js";
import { getRates, setManualRates } from "./service.js";

export const ratesRouter = Router();

// Endpoint público: cualquiera puede consultar las tasas (el frontend lo usa).
ratesRouter.get(
  "/",
  asyncHandler(async (_req, res) => {
    res.json(getRates());
  }),
);

// Endpoint admin: override manual de tasas (si el BCV falla o se quiere ajustar).
ratesRouter.post(
  "/admin",
  requireAuth,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const schema = z.object({
      usdToBs: z.number().positive().optional(),
      usdToCop: z.number().positive().optional(),
    });
    const data = parseBody(schema, req.body);
    setManualRates(data);
    res.json({ ok: true, ...getRates() });
  }),
);
