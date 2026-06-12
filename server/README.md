# BetmarPlay — Backend (`server/`)

API REST + servidor de tiempo real (Socket.IO) para BetmarPlay. Provee autenticación,
billetera con ledger contable y los juegos en vivo (Bingo, Dominó, Póker).

> El frontend Next.js vive en `../vegasve/` y se conecta a este backend vía
> `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL`.

## Stack
- Node 20 + TypeScript (ESM) · Express · Socket.IO
- PostgreSQL (Neon) vía Prisma + **driver serverless de Neon** (HTTPS/WebSocket, puerto 443)
- Auth JWT (bearer) · bcrypt · validación con zod
- Dinero en **céntimos** (`BigInt`), nunca floats. Ledger de doble entrada.

### Nota de conexión a la base (importante)
El protocolo Postgres nativo (puerto 5432) está bloqueado en algunos entornos (egress solo
HTTP/HTTPS). Por eso usamos `@neondatabase/serverless` + `@prisma/adapter-neon`, que hablan
con Neon por **puerto 443**. Funciona igual en local, en este entorno de desarrollo y en
Render. Las migraciones se aplican generando el DDL con `prisma migrate diff` y ejecutándolo
por HTTPS (ver abajo), porque `prisma migrate`/`db push` usan 5432.

## Desarrollo

```bash
cd server
npm install
cp .env.example .env     # rellena DATABASE_URL (Neon), JWT_*, ADMIN_EMAIL
npm run dev              # http://localhost:4000  (health: /health)
```

Variables de `.env`: `DATABASE_URL` (pooled), `DIRECT_URL` (directa, para migraciones),
`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `ADMIN_EMAIL`, `CORS_ORIGINS`, `PORT`, `BS_PER_USD`.

## Base de datos

```bash
# 1) Generar el cliente Prisma
npx prisma generate

# 2) Generar el DDL desde el esquema (sin tocar la DB)
npx prisma migrate diff --from-empty --to-schema-datamodel ./prisma/schema.prisma --script > prisma/init.sql

# 3) Aplicar el DDL por HTTPS (script incluido)
npm run db:apply        # ejecuta prisma/init.sql contra Neon vía WebSocket/443
```

Si tu red permite el puerto 5432, también sirve `npx prisma db push`.

## Estructura
```
src/
  index.ts     Arranque: Express + Socket.IO en el mismo http.Server
  env.ts       Config validada con zod
  db.ts        Cliente Prisma sobre el adaptador Neon (443)
  json.ts      Serialización de BigInt -> Number para las respuestas
  auth/        (Módulo 1)  register/login/me, JWT, middleware
  wallet/      (Módulo 2)  ledger, depósitos/retiros, aprobaciones
  realtime/    (Módulo 3)  núcleo Socket.IO: rooms, escrow/payout
  games/       (Módulos 4-6)  bingo, domino, poker
  admin/       (Módulo 7)  métricas, usuarios, cola de aprobaciones
prisma/
  schema.prisma  Modelo de datos
  init.sql       DDL generado
  seed.ts        Seed (asegura el rol admin)
```

## Deploy (Render)
Hay `Dockerfile` y `render.yaml` (Blueprint, en la raíz del repo) listos. Plan **free, sin tarjeta**.
Resumen: crear cuenta en render.com con GitHub → **New + → Blueprint** → elegir este repo → Render
lee `render.yaml` y crea el servicio con el Dockerfile → pegar los secretos (`DATABASE_URL`,
`JWT_*`, `CORS_ORIGINS`, `ADMIN_EMAIL`). `autoDeploy: true` redepliega en cada push a `main`.
Guía completa para Windows: [`DESPLIEGUE.md`](./DESPLIEGUE.md). (Fly.io se descartó: quitó el free
tier en 2026.)
