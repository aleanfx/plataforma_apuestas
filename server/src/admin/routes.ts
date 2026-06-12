import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBody } from "../http.js";
import { requireAuth, requireAdmin, type AuthedRequest } from "../auth/middleware.js";
import * as wallet from "../wallet/service.js";
import * as admin from "./service.js";
import { hub } from "../realtime/index.js";

// Rutas de administración: cola de aprobaciones (Módulo 2) + métricas, usuarios
// y mesas en vivo (Módulo 7).
export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

adminRouter.get(
  "/metrics",
  asyncHandler(async (_req, res) => {
    const metrics = await admin.getMetrics();
    res.json({ ...metrics, online: hub.onlineCount(), tables: hub.listTables().length });
  }),
);

adminRouter.get(
  "/users",
  asyncHandler(async (_req, res) => {
    res.json({ users: await admin.listUsers() });
  }),
);

const statusSchema = z.object({ status: z.enum(["active", "suspended"]) });
adminRouter.post(
  "/users/:id/status",
  asyncHandler(async (req, res) => {
    const { status } = parseBody(statusSchema, req.body);
    await admin.setUserStatus(req.params.id, status);
    res.json({ ok: true });
  }),
);

adminRouter.get(
  "/tables",
  asyncHandler(async (_req, res) => {
    res.json({ tables: hub.listTables() });
  }),
);

adminRouter.get(
  "/requests",
  asyncHandler(async (_req, res) => {
    const requests = await wallet.getPendingRequests();
    res.json({ requests });
  }),
);

adminRouter.post(
  "/deposits/:id/approve",
  asyncHandler(async (req: AuthedRequest, res) => {
    await wallet.approveDeposit(req.params.id, req.user!.sub);
    res.json({ ok: true });
  }),
);

adminRouter.post(
  "/deposits/:id/reject",
  asyncHandler(async (req: AuthedRequest, res) => {
    await wallet.rejectDeposit(req.params.id, req.user!.sub);
    res.json({ ok: true });
  }),
);

adminRouter.post(
  "/withdrawals/:id/approve",
  asyncHandler(async (req: AuthedRequest, res) => {
    await wallet.approveWithdraw(req.params.id, req.user!.sub);
    res.json({ ok: true });
  }),
);

adminRouter.post(
  "/withdrawals/:id/reject",
  asyncHandler(async (req: AuthedRequest, res) => {
    await wallet.rejectWithdraw(req.params.id, req.user!.sub);
    res.json({ ok: true });
  }),
);
