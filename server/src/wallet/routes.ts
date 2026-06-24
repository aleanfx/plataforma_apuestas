import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBody } from "../http.js";
import { requireAuth, type AuthedRequest } from "../auth/middleware.js";
import * as wallet from "./service.js";

export const walletRouter = Router();
walletRouter.use(requireAuth);

const methodSchema = z.enum(wallet.PAYMENT_METHODS);
const amountSchema = z.number().int().positive("Monto inválido"); // céntimos

const depositSchema = z.object({
  method: methodSchema,
  amount: amountSchema,
  reference: z.string().max(120).optional(),
  proofUrl: z.string().max(500000).optional(), // data URL de la captura del comprobante
});

const withdrawSchema = z.object({
  method: methodSchema,
  amount: amountSchema,
  destination: z.string().min(3, "Indica la cuenta destino").max(120),
});

walletRouter.post(
  "/deposit",
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = parseBody(depositSchema, req.body);
    const r = await wallet.createDeposit(req.user!.sub, data);
    res.status(201).json({ id: r.id, status: r.status });
  }),
);

walletRouter.post(
  "/withdraw",
  asyncHandler(async (req: AuthedRequest, res) => {
    const data = parseBody(withdrawSchema, req.body);
    const r = await wallet.createWithdraw(req.user!.sub, data);
    res.status(201).json({ id: r.id, status: r.status });
  }),
);

walletRouter.get(
  "/transactions",
  asyncHandler(async (req: AuthedRequest, res) => {
    const txs = await wallet.getTransactions(req.user!.sub);
    res.json({ transactions: txs });
  }),
);
