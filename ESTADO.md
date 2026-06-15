# ESTADO — BetmarPlay

> Estado de avance del proyecto. Última actualización: **14 de junio de 2026**.
> 🟢 **EN PRODUCCIÓN:** frontend https://plataforma-apuestas.vercel.app · backend
> https://betmarplay-server.onrender.com (Render free) · DB Neon. Login y juegos funcionando.
> Documento maestro de contexto: [`vegasve/CONTINUIDAD.md`](./vegasve/CONTINUIDAD.md).
> **Bitácora completa de construcción (qué se hizo, errores y soluciones, lecciones):**
> [`BITACORA.md`](./BITACORA.md) — léela si retomas sin contexto.

BetmarPlay pasó de ser un **frontend estático** (datos hardcodeados) a una app con **backend real**.
El backend nuevo vive en [`server/`](./server/) y el frontend en [`vegasve/`](./vegasve/) se conecta
a él vía REST + Socket.IO.

## Arquitectura actual

```
plataforma_apuestas/
  vegasve/   Frontend Next.js 14 (Vercel)  →  se conecta por NEXT_PUBLIC_API_URL / _SOCKET_URL
  server/    Backend Node 20 + TS (Express + Socket.IO + Prisma + Postgres Neon)  →  Render
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
| 8 | Hardening + deploy (rate-limit, helmet, logging) | ✅ Completo · **desplegado en Render + Vercel** |

> **MVP completo y EN VIVO.** Suite: **110 pruebas e2e en verde**. Parley y Caballos = **Fase 2**.
> Desplegado el 13/06/2026 (backend en Render free, frontend en Vercel). Guía usada:
> [`server/DESPLIEGUE.md`](./server/DESPLIEGUE.md).

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

## Mejoras de jugabilidad y UX (14/06/2026)

- **🤖 Practicar vs CPU:** botón en cada juego que crea una mesa con bots automáticos y
  **dinero de juguete** (no toca el saldo real). Para probar sin más jugadores. Verificado con
  `scripts/smoke-practice.ts` (9/9). Infra: escrow inyectable (`realEscrow`/`practiceEscrow`),
  `BotController` + deciders en `src/realtime/bots.ts`, `src/games/practice.ts`, evento `table:practice`.
- **⏱️ Temporizador de turno (25s) + auto-acción** en dominó y póker: si un jugador no actúa (AFK o
  desconectado), el servidor juega/pasa o hace check/fold. Arregla el congelamiento de mesas.
- **🔌 Reconexión:** al refrescar la página vuelves a tu mesa (`table:rejoinable`).
- **🟡 Overlay "servidor despertando":** mientras Render free arranca (~1 min), muestra "Preparando la
  mesa…" en vez de dejar al usuario a ciegas. Se quita solo al revivir.
- **🔊 Sonidos + animaciones:** efectos sintetizados (Web Audio, sin archivos) + botón de silencio;
  animaciones de bolita/fichas/cartas.
- **💬 Chat de mesa en vivo** en los 3 juegos. **📱 Ajustes móviles.** Filtros del historial del perfil.

## Cuentas, perfil y rediseño visual (14/06/2026)

- **📸 Foto de perfil:** cualquier usuario sube su foto desde `/perfil` (se redimensiona a 220px y se
  guarda como data URL en `User.avatarUrl`). Se muestra en perfil y navbar. Backend: `PATCH /auth/avatar`.
  **Columna `avatarUrl` añadida a Neon** vía `server/prisma/add-avatar.ts` (ALTER por 443).
- **🔵 Login con Google (código listo, ⏸️ PENDIENTE de activar):** `POST /auth/google` verifica el ID
  token con `google-auth-library`; front con Google Identity Services (`components/google-signin.tsx`).
  Falta: la cuenta `betmarplay@gmail.com` está en revisión por Google → cuando se reactive, crear el
  OAuth Client ID y poner `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Vercel) + `GOOGLE_CLIENT_ID` (Render). Sin eso
  el botón muestra "pronto" sin romper nada.
- **🎨 Rediseño visual de los juegos (en curso, primero Dominó):** Dominó con **fichas de puntos reales**
  (`components/domino-piece.tsx`), mesa de fieltro, **todo en un solo recuadro** (`.game-stage`), tablero
  en **línea única que se auto-escala** (sin scroll ni wrap), animación de colocación, clack de madera,
  fichas del rival como dominó de espalda. **Chat flotante** (botón + burbujas notificación). Bingo:
  tablero 1-75 + bola 3D. Póker: mesa ovalada. **Falta:** llevar Póker y Bingo al nivel de Dominó.
- **🖥️ Pantalla completa** (`components/fullscreen-toggle.tsx`, PC + Android). Práctica de **Dominó a 4**
  (parejas, verificado).

## Lo que falta (acción tuya)

- ✅ ~~**Desplegar:** backend a Render + variables en Vercel.~~ **HECHO** (13/06/2026). En vivo.
- ⏸️ **Activar Google login:** crear OAuth Client ID cuando Google reactive la cuenta + poner las 2
  variables de entorno (ver arriba).
- 🔒 **Rotar** la contraseña de Neon y el token de GitHub (se compartieron en el chat). Tras rotar
  Neon: actualizar `DATABASE_URL` en Render (Environment) y en `server/.env`.
- **Crear admin:** registrarse en la web con `betmarplay@gmail.com` → rol admin automático.
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

- Deploy a **Render** (hay `Dockerfile` y `render.yaml` listos; free tier sin tarjeta).
- **Rotar** la contraseña de Neon (se compartió en chat).
- Temas regulatorios: licencia de juego, KYC/AML, términos, juego responsable.
