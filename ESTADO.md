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
| 3 | Núcleo tiempo real (Socket.IO: rooms, escrow/payout) | ✅ Completo |
| 4 | Bingo (sala multi-jugador, canto automático) | ✅ Completo |
| 5 | Dominó (mesa 2-4, turnos, tranque) | ✅ Completo |
| 6 | Póker (Texas Hold'em, side pots, showdown) | ✅ Completo |
| 7 | Admin real (métricas, usuarios, mesas) | ✅ Completo |
| 8 | Hardening + deploy (rate-limit, helmet, logging) | ✅ Hardening hecho · deploy lo corres tú |

> **MVP completo.** Suite: **110 pruebas e2e en verde**. Parley y Caballos = **Fase 2**.
> Para desplegar: sigue [`server/DESPLIEGUE.md`](./server/DESPLIEGUE.md) (Fly.io + Vercel).

## Lo que YA funciona (probado end-to-end contra Neon real — 110 pruebas)

- **Auth:** registro/login/refresh con rotación/logout/`me`; rutas `/lobby`,`/profile`,`/admin`
  protegidas. `betmarplay@gmail.com` es admin. → test-auth (16/16).
- **Billetera:** depósito→aprobación→acreditado; retiro con retención; **invariante contable** y
  **sin doble gasto** bajo concurrencia. → test-wallet (20/20).
- **Tiempo real:** Socket.IO con auth, mesas, presencia, reconexión, escrow. → test-realtime (16/16).
- **Bingo:** salas, compra de cartones, canto automático, línea, reparto. → test-bingo (18/18).
- **Dominó:** 2-4 jugadores (parejas), turnos validados, tranque, reparto. → test-domino (17/17).
- **Póker:** Texas Hold'em, buy-in/cash-out, side pots, showdown. → test-poker (12/12).
- **Admin:** métricas, usuarios (suspender/reactivar), mesas en vivo. → test-admin (11/11).
- **Hardening:** rate-limit (anti fuerza bruta), helmet, logging, límite de body, `trust proxy`.
- **Frontend:** todas las páginas conectadas a datos reales; `/bingo`,`/domino`,`/poker` server-driven.
  Build de `vegasve/` en verde.

## Lo que falta (acción tuya)

- **Desplegar:** backend a Fly.io + variables en Vercel — guía en [`server/DESPLIEGUE.md`](./server/DESPLIEGUE.md).
  ⚠️ Hasta entonces, el frontend en producción apunta a `localhost` y el login no funcionará allí.
- **Fase 2:** Parley y Caballos (siguen como prototipo).
- **Producto regulado:** licencia, KYC/AML, juego responsable (fuera de código).

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
