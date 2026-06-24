import { Router } from "express";
import { z } from "zod";
import { asyncHandler, parseBody } from "../http.js";
import { requireAuth, type AuthedRequest } from "./middleware.js";
import { authLimiter } from "../middleware/rateLimit.js";
import * as auth from "./service.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email("Correo inválido"),
  name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
  password: z.string().min(8, "La contraseña debe tener al menos 8 caracteres"),
});

const loginSchema = z.object({
  email: z.string().min(1, "Ingresa tu correo"),
  password: z.string().min(1, "Ingresa tu contraseña"),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

const googleSchema = z.object({
  credential: z.string().min(10, "Falta el credential de Google"),
});

const avatarSchema = z.object({
  avatarUrl: z.string().min(1).max(90_000),
});

authRouter.post(
  "/register",
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = parseBody(registerSchema, req.body);
    const result = await auth.register(data);
    res.status(201).json(result);
  }),
);

authRouter.post(
  "/login",
  authLimiter,
  asyncHandler(async (req, res) => {
    const data = parseBody(loginSchema, req.body);
    const result = await auth.login(data);
    res.json(result);
  }),
);

authRouter.post(
  "/google",
  authLimiter,
  asyncHandler(async (req, res) => {
    const { credential } = parseBody(googleSchema, req.body);
    const result = await auth.loginWithGoogle(credential);
    res.json(result);
  }),
);

authRouter.post(
  "/refresh",
  asyncHandler(async (req, res) => {
    const { refreshToken } = parseBody(refreshSchema, req.body);
    const result = await auth.refresh(refreshToken);
    res.json(result);
  }),
);

authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const parsed = refreshSchema.safeParse(req.body);
    if (parsed.success) await auth.logout(parsed.data.refreshToken);
    res.json({ ok: true });
  }),
);

authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const user = await auth.getMe(req.user!.sub);
    res.json({ user });
  }),
);

authRouter.patch(
  "/avatar",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { avatarUrl } = parseBody(avatarSchema, req.body);
    const user = await auth.updateAvatar(req.user!.sub, avatarUrl);
    res.json({ user });
  }),
);

const currencySchema = z.object({
  currency: z.enum(["VES", "USD", "COP"]),
});

authRouter.patch(
  "/currency",
  requireAuth,
  asyncHandler(async (req: AuthedRequest, res) => {
    const { currency } = parseBody(currencySchema, req.body);
    const user = await auth.updateCurrency(req.user!.sub, currency);
    res.json({ user });
  }),
);
