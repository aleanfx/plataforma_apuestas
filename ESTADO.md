# ESTADO — BetmarPlay

> Estado de avance del proyecto. Última actualización: **12 de junio de 2026**.
> Documento maestro de contexto: [`vegasve/CONTINUIDAD.md`](./vegasve/CONTINUIDAD.md).
> Plan de implementación del backend: aprobado, 9 módulos (ver más abajo).

BetmarPlay pasó de ser un **frontend estático** (datos hardcodeados) a una app con **backend real**.
El backend nuevo vive en [`server/`](./server/) y el frontend en [`vegasve/`](./vegasve/) se conecta
a él vía REST + Socket.IO.

## Arquitectura actual

```
plataforma_apuestas/
  vegasve/   Frontend Next.js 14 (Vercel)  →  se conecta por NEXT_PUBLIC_API_URL / _SOCKET_URL
  server/    Backend Node 20 + TS (Express + Socket.IO + Prisma + Postgres Neon)  →  Fly.io
```

- **Dinero:** ledger de doble entrada, montos en **céntimos** (`BigInt`), aprobación **manual** en `/admin`.
- **Base de datos:** Neon (Postgres) vía **driver serverless sobre HTTPS/443** (el puerto 5432 está
  bloqueado en el entorno de desarrollo — ver `CLAUDE.md` y `server/README.md`).
- **Auth:** JWT bearer (access + refresh con rotación), bcrypt.

## Progreso por módulos

| # | Módulo | Estado |
| - | ------ | ------ |
| 0 | Infra & scaffolding (server/, DB, Express+Socket.IO, deploy skeleton) | ✅ Completo |
| 1 | Auth real (registro/login/refresh/logout/me, rutas protegidas) | ✅ Completo |
| 2 | Billetera + Ledger (depósitos/retiros, aprobación admin) | ✅ Completo |
| 3 | Núcleo tiempo real (Socket.IO: rooms, escrow/payout) | ⏳ Siguiente |
| 4 | Bingo (sala multi-jugador, canto automático) | ⏳ Pendiente |
| 5 | Dominó (mesa 2-4, turnos, tranque) | ⏳ Pendiente |
| 6 | Póker (Texas Hold'em, side pots, showdown) | ⏳ Pendiente |
| 7 | Admin real (métricas, usuarios, mesas) | ⏳ Pendiente |
| 8 | Hardening & deploy (Fly.io + Vercel) | ⏳ Pendiente |

> Parley y Caballos = **Fase 2**, no se tocan.

## Lo que YA funciona (probado end-to-end contra Neon real)

- **Auth:** registrarse crea la cuenta con saldo 0; `betmarplay@gmail.com` es admin automáticamente.
  Login, sesión persistente (`/me`), refresh con rotación, logout. Rutas `/lobby`, `/profile`,
  `/admin` protegidas (admin exige rol). → `server/scripts/test-auth.ts` (16/16).
- **Billetera:** depósito → aprobación en `/admin` → saldo acreditado; retiro con retención
  inmediata (rechazo reintegra); **invariante contable** (ledger == balance) y **sin doble gasto**
  bajo concurrencia. → `server/scripts/test-wallet.ts` (20/20).
- **Frontend:** navbar/lobby/perfil muestran saldo real; modal de billetera real; historial real;
  cola de aprobaciones del admin funcional. Build de `vegasve/` en verde.

## Lo que falta

- Los **3 juegos en tiempo real** (Módulos 3-6) — requieren el núcleo Socket.IO.
- El **resto del panel admin** (métricas, tabla de usuarios, juegos) sigue con datos de muestra
  (Módulo 7). La cola de pagos ya es real.
- **Deploy** del backend a Fly.io y configurar `NEXT_PUBLIC_API_URL` en Vercel (Módulo 8).
  ⚠️ Hasta entonces, el frontend apunta a `http://localhost:4000` por defecto.

## Cómo arrancar (desarrollo)

```bash
# Terminal 1 — backend
cd server
npm install
# .env ya tiene DATABASE_URL (Neon), JWT secrets y ADMIN_EMAIL
npm run dev            # http://localhost:4000  (health: /health)

# Terminal 2 — frontend
cd vegasve
npm install
npm run dev            # http://localhost:3000
```

Pruebas del backend (con el server vivo en otra terminal):
```bash
cd server
npx tsx scripts/test-auth.ts
npx tsx scripts/test-wallet.ts
```

## Pendientes del usuario (fuera de código)

- Deploy a **Fly.io** cuando lleguemos al Módulo 8 (hay `Dockerfile` y `fly.toml` listos).
- **Rotar** la contraseña de Neon (se compartió en chat).
- Temas regulatorios: licencia de juego, KYC/AML, términos, juego responsable.
