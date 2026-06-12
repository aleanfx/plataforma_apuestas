import "./json.js"; // parche BigInt -> JSON (debe ir primero)
import http from "node:http";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { Server as SocketIOServer } from "socket.io";

import { env } from "./env.js";
import { generalLimiter } from "./middleware/rateLimit.js";
import { prisma } from "./db.js";
import { errorHandler } from "./http.js";
import { authRouter } from "./auth/routes.js";
import { walletRouter } from "./wallet/routes.js";
import { adminRouter } from "./admin/routes.js";
import { initRealtime, hub } from "./realtime/index.js";
import { CounterEngine } from "./realtime/test-engine.js";
import { initBingo, createBingoSala } from "./games/bingo/index.js";
import { initDomino, createDominoMesa } from "./games/domino/index.js";
import { initPoker, createPokerMesa } from "./games/poker/index.js";

const app = express();

// Detrás del proxy de Render: necesario para ver la IP real (rate limit) y HTTPS.
app.set("trust proxy", 1);

// Cabeceras de seguridad. Es una API JSON, sin CSP de HTML.
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));

// Logging de peticiones.
app.use(morgan(process.env.NODE_ENV === "production" ? "tiny" : "dev"));

// CORS: solo orígenes en la whitelist (front local / Vercel).
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json({ limit: "100kb" }));

// Health check (lo usa Render). Va antes del rate limit para no limitarlo.
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "betmarplay-server", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ name: "BetmarPlay API", status: "online" });
});

// Límite general de la API (después del health check).
app.use(generalLimiter);

// --- Rutas REST ---
app.use("/auth", authRouter);
app.use("/wallet", walletRouter);
app.use("/admin", adminRouter);

// Endpoint SOLO de desarrollo: crea una mesa de prueba para validar el tiempo real.
if (process.env.NODE_ENV !== "production") {
  app.post("/dev/test-table", (req, res) => {
    const id = crypto.randomUUID();
    hub.createTable({
      id,
      name: "Mesa de prueba",
      stake: Number(req.body?.stake ?? 0),
      engine: new CounterEngine(),
    });
    res.json({ tableId: id });
  });

  // Sala de bingo con ritmo rápido y sin auto-arranque, para pruebas e2e.
  app.post("/dev/bingo-table", (req, res) => {
    const table = createBingoSala(hub, {
      name: "Bingo de prueba",
      stake: Number(req.body?.stake ?? 2000),
      callIntervalMs: 25,
      resetDelayMs: 400,
      autoStartMs: 0,
    });
    res.json({ tableId: table.id });
  });

  // Mesa de dominó para pruebas e2e.
  app.post("/dev/domino-table", (req, res) => {
    const table = createDominoMesa(hub, {
      name: "Dominó de prueba",
      stake: Number(req.body?.stake ?? 5000),
      seats: (Number(req.body?.seats) === 4 ? 4 : 2) as 2 | 4,
      resetDelayMs: 400,
    });
    res.json({ tableId: table.id });
  });

  // Mesa de póker para pruebas e2e (manos encadenadas rápido).
  app.post("/dev/poker-table", (req, res) => {
    const table = createPokerMesa(hub, {
      name: "Póker de prueba",
      seats: Number(req.body?.seats ?? 3),
      buyIn: Number(req.body?.buyIn ?? 10000),
      smallBlind: Number(req.body?.smallBlind ?? 50),
      bigBlind: Number(req.body?.bigBlind ?? 100),
      handDelayMs: 150,
    });
    res.json({ tableId: table.id });
  });
}

// Error handler global (siempre al final de las rutas).
app.use(errorHandler);

const server = http.createServer(app);

// --- Socket.IO (núcleo de tiempo real, se desarrolla en el Módulo 3) ---
export const io = new SocketIOServer(server, {
  cors: {
    origin: env.corsOrigins,
    credentials: true,
  },
});

// Núcleo de tiempo real: auth de handshake, mesas, presencia, reconexión.
initRealtime(io);
// Salas de bingo fijas (Módulo 4).
initBingo(hub);
// Mesas de dominó fijas (Módulo 5).
initDomino(hub);
// Mesas de póker fijas (Módulo 6).
initPoker(hub);

async function start() {
  // Verifica la conexión a la base de datos antes de aceptar tráfico.
  try {
    await prisma.$connect();
    console.log("✅ Conectado a PostgreSQL");
  } catch (err) {
    console.error("❌ No se pudo conectar a la base de datos:", err);
    process.exit(1);
  }

  server.listen(env.PORT, () => {
    console.log(`🚀 BetmarPlay API escuchando en http://localhost:${env.PORT}`);
    console.log(`   CORS permitido para: ${env.corsOrigins.join(", ")}`);
  });
}

start();

// Cierre limpio.
for (const sig of ["SIGINT", "SIGTERM"] as const) {
  process.on(sig, async () => {
    console.log(`\n${sig} recibido, cerrando…`);
    await prisma.$disconnect();
    server.close(() => process.exit(0));
  });
}
