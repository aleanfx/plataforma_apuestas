# CLAUDE.md — Orientación para sesiones de Claude Code

Este repo contiene **BetmarPlay**, una plataforma de casino y apuestas para Venezuela:
un **frontend** Next.js 14 en [`vegasve/`](./vegasve/) y un **backend** Node/TS en
[`server/`](./server/). El frontend ya **no** es solo un prototipo estático: auth y billetera
son reales (ver estado abajo). Los 3 juegos en tiempo real están en construcción.

## Lo primero que debes saber

- **Hay dos proyectos:** el frontend en [`vegasve/`](./vegasve/) y el backend en
  [`server/`](./server/). Cada uno tiene su `package.json`; corre `npm` dentro de la carpeta
  correspondiente.
- **Lee [`ESTADO.md`](./ESTADO.md)** — resumen de avance por módulos (qué está hecho y qué falta).
- **Lee [`vegasve/CONTINUIDAD.md`](./vegasve/CONTINUIDAD.md)** — documento maestro: arquitectura,
  dónde está cada cosa, decisiones de UX ya resueltas (para no re-romperlas) y el backend.
- Backend: [`server/README.md`](./server/README.md). Frontend: [`vegasve/README.md`](./vegasve/README.md).

## Backend (`server/`) — lo esencial

- Stack: Node 20 + TypeScript (ESM), Express + Socket.IO, Prisma, **Postgres en Neon**.
- **⚠️ El puerto 5432 está BLOQUEADO en este entorno** (solo sale HTTP/HTTPS 443). La DB se usa con
  el **driver serverless de Neon** (`@neondatabase/serverless` + `@prisma/adapter-neon`) sobre 443.
  Consecuencias:
  - `prisma db push` / `migrate dev` **NO funcionan aquí**. Para cambios de esquema:
    `npm run db:diff` (genera `prisma/init.sql`) y `npm run db:apply` (lo ejecuta por 443).
  - Versiones acopladas: `@prisma/client` y `@prisma/adapter-neon` ambos **5.22**;
    `@neondatabase/serverless` en **0.10.x** (el 1.x rompe el peer del adapter v5).
  - Para conectarse a la DB desde Bash en este entorno hay que usar `dangerouslyDisableSandbox`.
- **Dinero en céntimos** (`BigInt`), nunca floats. Todo movimiento pasa por `applyLedger`
  (`src/wallet/ledger.ts`) dentro de una transacción.
- Comandos:
  ```bash
  cd server
  npm install
  npm run dev          # http://localhost:4000  (health: /health)
  npm run typecheck    # tsc --noEmit (debe quedar en verde)
  npx tsx scripts/test-auth.ts     # con el server vivo: pruebas e2e de auth
  npx tsx scripts/test-wallet.ts   # con el server vivo: pruebas e2e de billetera
  ```
- `server/.env` (gitignored) ya tiene `DATABASE_URL` (Neon), `JWT_*`, `ADMIN_EMAIL=betmarplay@gmail.com`.
- Admin: el usuario con ese email recibe rol admin al registrarse.

## Comandos

```bash
cd vegasve
npm install
npm run dev      # desarrollo en http://localhost:3000
npm run build    # debe quedar SIEMPRE en verde antes de subir
```

## Dónde se edita lo más común

- **Juegos** (disponibles y "Próximamente"): arrays `GAMES` y `SOON` en
  `vegasve/components/game-cards.tsx`.
- **Tema / estilos / responsive:** `vegasve/app/globals.css` (tokens + componentes + breakpoints).
- **Navbar / Footer:** `vegasve/components/site-nav.tsx` y `site-footer.tsx`.
- **Modales:** `auth-dialog.tsx`, `wallet-dialog.tsx`, base en `components/ui/dialog.tsx`.
- **Fotos de tarjetas:** `vegasve/public/games/<slug>.jpg`.

## Git y despliegue (clave en sesiones remotas)

- El **git root es la raíz del repo** (no `vegasve/`).
- **Frontend** (Vercel: https://plataforma-apuestas.vercel.app) **despliega desde `main`**.
  Empujar a `main` un commit fast-forward dispara el deploy automático.
- **⚠️ Antes de empujar cambios del frontend a `main`:** el front llama al backend vía
  `NEXT_PUBLIC_API_URL` (por defecto `http://localhost:4000`). Si Vercel no tiene esa variable
  apuntando al backend desplegado, la producción quedará sin poder loguear. No empujes el frontend
  a producción hasta que el backend esté en Fly.io y la variable esté configurada en Vercel.
- **Backend** (`server/`) se despliega a **Fly.io** (`fly deploy`, hay `Dockerfile` y `fly.toml`).
  Es always-on (`min_machines_running = 1`) para no cortar partidas en vivo.
- En el entorno remoto **no hay credenciales de escritura**: para `git push` se necesita un
  **GitHub Personal Access Token** (scope `public_repo`). Úsalo de una sola vez en la URL y no
  lo guardes en la config:
  `git push "https://x-access-token:<TOKEN>@github.com/aleanfx/plataforma_apuestas.git" HEAD:main`
- Los commits salen como **"Unverified"** (sin GPG en el entorno): es cosmético, **no** reescribas
  el historial de `main` por eso.
- El usuario a veces sube archivos directo a `main` por la web de GitHub: haz
  `git fetch origin main && git rebase origin/main` antes de trabajar.

## Convenciones

- Mantén el estilo del código existente (mismas clases CSS, idioma español en la UI/copys).
- Cambios solo de móvil → ajústalos en los `@media` de `globals.css`, sin tocar PC.
- Antes de subir: `npm run build` en verde.
