import { Router } from "express";
import { asyncHandler } from "../http.js";
import { requireAuth, requireAdmin, type AuthedRequest } from "../auth/middleware.js";
import * as wallet from "../wallet/service.js";

// Rutas de administración. La cola de aprobaciones (Módulo 2) vive aquí;
// métricas y gestión de usuarios se amplían en el Módulo 7.
export const adminRouter = Router();
adminRouter.use(requireAuth, requireAdmin);

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
