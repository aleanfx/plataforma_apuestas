import rateLimit from "express-rate-limit";

// Solo se aplica el rate limit en producción (en dev/tests estorbaría).
const onlyInProd = () => process.env.NODE_ENV !== "production";

// Límite general para toda la API (anti-abuso).
export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600, // por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  skip: onlyInProd,
  message: { error: "Demasiadas solicitudes, intenta más tarde." },
});

// Límite estricto para login/registro (anti fuerza bruta).
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20, // por IP cada 15 min
  standardHeaders: true,
  legacyHeaders: false,
  skip: onlyInProd,
  message: { error: "Demasiados intentos. Espera unos minutos." },
});
