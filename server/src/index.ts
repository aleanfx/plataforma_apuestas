import "./json.js"; // parche BigInt -> JSON (debe ir primero)
import http from "node:http";
import crypto from "node:crypto";
import express from "express";
import cors from "cors";
import { Server as SocketIOServer } from "socket.io";

import { env } from "./env.js";
import { prisma } from "./db.js";
import { errorHandler } from "./http.js";
import { authRouter } from "./auth/routes.js";
import { walletRouter } from "./wallet/routes.js";
import { adminRouter } from "./admin/routes.js";
import { initRealtime, hub } from "./realtime/index.js";
import { CounterEngine } from "./realtime/test-engine.js";

const app = express();

// CORS: solo orígenes en la whitelist (front local / Vercel).
app.use(
  cors({
    origin: env.corsOrigins,
    credentials: true,
  }),
);
app.use(express.json());

// Health check (lo usa Fly.io para saber si el server está vivo).
app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "betmarplay-server", time: new Date().toISOString() });
});

app.get("/", (_req, res) => {
  res.json({ name: "BetmarPlay API", status: "online" });
});

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
