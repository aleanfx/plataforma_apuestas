# BITÁCORA DE CONSTRUCCIÓN — BetmarPlay Backend (MVP)

> Documento de traspaso completo de la sesión en que se construyó el backend (Módulos 0-8).
> Pensado para que una sesión nueva entienda **todo** sin leer el historial del chat:
> qué se hizo, por qué, **qué errores aparecieron y cómo se resolvieron**, y los patrones útiles.
> Léelo junto a: [`ESTADO.md`](./ESTADO.md), [`CLAUDE.md`](./CLAUDE.md),
> [`vegasve/CONTINUIDAD.md`](./vegasve/CONTINUIDAD.md) §13, [`server/README.md`](./server/README.md),
> [`server/DESPLIEGUE.md`](./server/DESPLIEGUE.md). Fecha: **12 de junio de 2026**.

---

## 1. Resumen ejecutivo

BetmarPlay pasó de ser un **frontend Next.js estático** (todo hardcodeado) a un **MVP con backend real**:
auth, billetera con ledger contable, **3 juegos multijugador en tiempo real** (Bingo, Dominó, Póker)
y panel admin. Todo el dinero es saldo interno real (céntimos), con depósitos/retiros por **aprobación
manual**. **110 pruebas e2e en verde** contra la base real (Neon). 🟢 **DESPLEGADO EN PRODUCCIÓN
el 13/06/2026** y verificado funcionando (login + juegos).

- **Repo:** https://github.com/aleanfx/plataforma_apuestas — todo en `main`.
- **Frontend (en vivo):** https://plataforma-apuestas.vercel.app — `vegasve/` (Next.js 14, Vercel).
- **Backend (en vivo):** https://betmarplay-server.onrender.com — `server/` (Node 20 + TS, Render free).
- **DB:** Neon (Postgres, us-east). El backend de Render también está en us-east (misma región).

### Decisiones de producto (tomadas con el dueño, NO re-litigar)
- **Dinero:** ledger doble entrada + **aprobación manual** en `/admin`. Sin APIs de pago.
- **Hosting:** frontend Vercel; backend **Render** (free, sin tarjeta — Fly.io se descartó porque
  en 2026 quitó el free tier); Postgres Neon.
- **Juegos:** orden Bingo → Dominó → Póker. **Parley y Caballos = Fase 2** (no tocar).
- **Reuso:** solo libs MIT puntuales (`pokersolver`); la lógica de juego se escribió a mano.
- **Auth:** JWT bearer (access 7d + refresh con rotación, 30d), no cookies (cross-domain).
- **Admin:** `betmarplay@gmail.com` recibe rol admin al registrarse.

---

## 2. ⚠️ EL ERROR MÁS IMPORTANTE (léelo siempre): puerto 5432 bloqueado

El entorno de ejecución **solo permite egress HTTP/HTTPS (puerto 443)**. El protocolo Postgres
nativo (**5432) está BLOQUEADO**: las conexiones TCP abren pero el tráfico se resetea/expira.
Se verificó con tests de DNS/TCP/TLS y persiste **incluso con `dangerouslyDisableSandbox`** → no es
el sandbox de Bash, es la red del entorno.

**Solución (clave del proyecto):** usar el **driver serverless de Neon** (`@neondatabase/serverless`)
con el adaptador `@prisma/adapter-neon`, que habla con la base por **WebSocket/HTTPS sobre 443**.
Configurado en `server/src/db.ts` (`neonConfig.webSocketConstructor = ws`). Funciona en este entorno,
en local y en Render.

**Consecuencias prácticas:**
- `prisma db push` y `prisma migrate dev` **NO funcionan aquí** (usan 5432). Para el esquema:
  - `npm run db:diff` → genera `prisma/init.sql` con `prisma migrate diff` (no toca la DB).
  - `npm run db:apply` → ejecuta ese SQL por 443 (`prisma/apply.ts` usa un `Pool` de Neon).
- Para conectarse a la DB desde Bash hay que usar **`dangerouslyDisableSandbox: true`** en la tool
  (el HTTPS sale igual, pero conviene para evitar resets intermitentes).
- **Versiones acopladas** (no subir a la ligera):
  - `@prisma/client` y `@prisma/adapter-neon` ambos **5.22.0**.
  - `@neondatabase/serverless` en **0.10.x** (el **1.x rompe el peer** del adapter v5 → error eresolve).
  - En `schema.prisma`: `generator client { previewFeatures = ["driverAdapters"] }`.
- `$queryRaw` sobre `information_schema` falla con *"Failed to deserialize column of type 'name'"* →
  **castear a `::text`** (ej. `table_name::text`).

---

## 3. Arquitectura

```
plataforma_apuestas/
  vegasve/                 Frontend Next.js 14 (App Router) — Vercel
    lib/api.ts             Cliente REST (token bearer + auto-refresh en 401)
    lib/socket.ts          Cliente Socket.IO (token en handshake)
    lib/auth-context.tsx   AuthProvider (sesión global) + useAuth()
    lib/money.ts           formatBs/formatUsd (céntimos -> texto)
    components/auth-guard.tsx       Protege rutas (admin exige rol)
    components/auth-dialog.tsx      Login/registro reales
    components/wallet-dialog.tsx    Depósito/retiro reales
    components/admin-queue|metrics|users|tables.tsx   Panel admin
    components/game-cards.tsx       Tarjetas del lobby (todas enlazan a su /pagina)
    app/{lobby,profile,admin}/      Conectadas a datos reales (client components)
    app/{bingo,domino,poker}/       Juegos server-driven por Socket.IO
    app/globals.css                 + estilos .bingo-* .domino-* .poker-* .pcard

  server/                  Backend Node 20 + TS (ESM) — Render
    src/index.ts           Arranque: Express + Socket.IO; helmet, morgan, cors, rate-limit;
                           monta /auth /wallet /admin; initRealtime + initBingo/Domino/Poker.
                           Endpoints /dev/* SOLO si NODE_ENV != production.
    src/env.ts             Config validada con zod
    src/db.ts              PrismaClient sobre el adaptador Neon (443)
    src/json.ts            Parche BigInt -> Number para JSON
    src/http.ts            asyncHandler, parseBody (zod), errorHandler global
    src/errors.ts          AppError + helpers (badRequest, unauthorized, ...)
    src/middleware/rateLimit.ts   generalLimiter + authLimiter (skip si != production)
    src/auth/              jwt, password (bcrypt), middleware (requireAuth/Admin), service, routes
    src/wallet/            ledger.ts (applyLedger atómico), service.ts, routes.ts
    src/admin/             service.ts (métricas/usuarios), routes.ts (aprobaciones + admin)
    src/realtime/          auth.ts (handshake), hub.ts (mesas/presencia/reconexión),
                           engine.ts (interfaz GameEngine), escrow.ts, index.ts (initRealtime)
                           test-engine.ts (CounterEngine, solo dev)
    src/games/bingo/       cards.ts, engine.ts, index.ts
    src/games/domino/      tiles.ts, engine.ts, index.ts
    src/games/poker/       cards.ts, handeval.ts (pokersolver), sidepots.ts, engine.ts, index.ts
    src/types/pokersolver.d.ts      Declaración de tipos (pokersolver no trae)
    prisma/schema.prisma   Modelo de datos
    prisma/{init.sql,apply.ts,seed.ts}
    scripts/test-*.ts      7 suites e2e (110 pruebas)
    Dockerfile, DESPLIEGUE.md   (+ render.yaml en la raíz del repo)
```

**Principio rector:** *server-authoritative*. El cliente nunca decide saldo, cartas, fichas ni
ganadores. El estado de juego vive en memoria en el servidor (Hub); el dinero pasa SIEMPRE por el
ledger dentro de transacciones.

---

## 4. Modelo de datos (Prisma — `server/prisma/schema.prisma`)

Todo el dinero en **céntimos de Bs** como `BigInt`. Nunca floats.

- **User** (id, email único, passwordHash, name, role `user|admin`, status `active|suspended`).
- **Account** (1:1 con User): `balance`, `bonus`, `locked` (céntimos).
- **LedgerEntry** (doble entrada): accountId, userId, `delta` (+/-), `type`
  (`deposit|withdraw|bet_stake|bet_payout|bonus|adjust`), refId, note. **Suma de deltas == balance.**
- **DepositRequest / WithdrawRequest**: method, amount, status `pending|approved|rejected`, reviewedBy.
- **GameTable / GameRound / GameResult**: definidos en el esquema para auditoría futura (los juegos
  hoy guardan el dinero vía ledger; estas tablas aún no se llenan — pendiente de hardening).
- **RefreshToken**: tokenHash (sha256), expiresAt, revokedAt (rotación de sesiones).

`datasource db` usa `url = DATABASE_URL` (pooled) + `directUrl = DIRECT_URL` (solo para migraciones).

---

## 5. Reglas del dinero (críticas)

- **`applyLedger(tx, {accountId, userId, delta, type, refId, note})`** (`src/wallet/ledger.ts`) es la
  ÚNICA primitiva de dinero. Débito = `updateMany` condicional `where balance >= monto` dentro de
  transacción → **imposible sobregirar**, aun en concurrencia (probado).
- **Depósito:** crea solicitud *pending* → admin aprueba → acredita. NO acredita antes.
- **Retiro:** **debita de inmediato** al solicitar (retención); aprobar = pagado; rechazar = reintegra.
- **Juegos (escrow, `src/realtime/escrow.ts`):** `chargeStake` (cobra apuesta/buy-in) y `payout`
  (paga premio/pozo), ambos vía `applyLedger`. En Póker el buy-in entrega fichas y el cash-out las
  devuelve a la billetera; dentro de la mano las fichas se mueven en memoria (suma cero).
- **Invariante verificado en cada juego:** suma del ledger por usuario == su balance; y conservación
  total (lo que entra a los pozos sale a los ganadores).

---

## 6. Protocolo de tiempo real (Socket.IO)

Handshake: el cliente manda `auth: { token }` (JWT). `src/realtime/auth.ts` lo valida y adjunta
`socket.data.user`. El **Hub** (`src/realtime/hub.ts`) gestiona mesas en memoria, membresía,
presencia (online/offline) y reconexión, y envía a cada jugador su **estado personalizado**
(oculta info privada, p. ej. las cartas de póker).

**Eventos (cliente → servidor, con ack):**
- `table:list { game }` → `{ tables: [...] }`
- `table:join { tableId }` → `{ ok, reason? }`
- `table:leave { tableId }` (sin ack)
- `table:action { tableId, action }` → `{ ok, reason? }`  (acciones según el juego)

**Eventos (servidor → cliente):**
- `table:state { table, game }` — `game` es el estado público que devuelve `engine.publicState`.
- `table:rejoinable { tableIds }` — al reconectar, mesas a las que el cliente debe re-unirse.

**Acciones por juego:**
- Bingo: `buy`, `start`.
- Dominó: `start`, `play {tileId,end}`, `pass`.
- Póker: `buyin`, `fold`, `check`, `call`, `raise {amount}`, `allin`.

Cada juego implementa `GameEngine` (`src/realtime/engine.ts`): `canJoin/onJoin/onLeave/onAction/publicState`.
Una **instancia de engine por mesa**. Los juegos con timers (Bingo canta solo, Póker encadena manos)
guardan una referencia `notify = () => hub.broadcast(table)` para emitir fuera de una acción.

---

## 7. Los juegos (resumen)

- **Bingo** (`src/games/bingo/`): 75 bolas, gana la **primera línea**. Compra de cartones con escrow,
  canto automático por `setInterval`, detección de línea, reparto del pozo (split si empate), auto-reset.
  Salas fijas Bs 20/50/100.
- **Dominó** (`src/games/domino/`): *block dominoes* 2-4 jugadores, **parejas** en mesa de 4
  (asientos 0&2 vs 1&3). Ficha de salida = doble más alto. Turnos validados, **tranque** (gana menor
  puntaje). Cobro de apuestas all-or-nothing (refund si alguien no tiene saldo). Mesas 1v1 Bs50 / Parejas Bs100.
- **Póker** (`src/games/poker/`): Texas Hold'em cash game. Buy-in/cash-out vía escrow, ciegas, rondas
  preflop/flop/turn/river, fold/check/call/raise/all-in, **side pots** (`sidepots.ts`), showdown con
  **`pokersolver`** (`handeval.ts`). Mesas buy-in Bs100/500, 6 asientos.

---

## 8. ERRORES / TRAMPAS encontrados y cómo se resolvieron

> Esto es lo más valioso para futuras sesiones. Lee antes de tocar las áreas relacionadas.

1. **Puerto 5432 bloqueado** → driver serverless de Neon sobre 443. Ver §2 (lo más importante).
2. **Conflicto de versiones Prisma/Neon** → adapter y client en 5.22, serverless en 0.10.x. El 1.x
   rompe el peer del adapter v5.
3. **`$queryRaw` + `information_schema`** → error de tipo `name`; castear `::text`.
4. **BigInt no serializa a JSON** → `src/json.ts` parchea `BigInt.prototype.toJSON = Number`. Debe
   importarse **primero** en `index.ts`. Seguro: un balance en céntimos cabe en `Number.MAX_SAFE_INTEGER`.
5. **El repo era un ZIP, no un clon git** (carpeta `-main`). Se hizo `git init` + `remote add` +
   `git fetch origin main` + `git reset --mixed origin/main` (¡`--mixed`, no `--soft`! con `--soft`
   el índice queda vacío y `git status` marca TODO como borrado). Se restauran archivos solo-de-origin
   antes de commitear para no borrar lo que el dueño subió por la web.
6. **El token de GitHub NO estaba en CLAUDE.md** — solo el procedimiento con `<TOKEN>`. El dueño debe
   pegar un PAT (scope `repo`). En el entorno no hay credenciales de escritura.
7. **`git push` con URL+token explícita NO actualiza el ref `origin/main` local** → `git log
   origin/main..main` muestra de más. El remoto real va por el output del push (`e57bf9d..83420ca`).
8. **Pushear a `main` dispara el deploy de producción en Vercel.** El frontend apunta a `localhost`
   por defecto → en producción el login queda roto hasta desplegar el backend y configurar
   `NEXT_PUBLIC_API_URL` en Vercel. (Se avisó; el dueño aun así pidió pushear a main.)
9. **Patrón de los tests de juego (bots):** dos sutilezas que costaron:
   - **"kick"**: los bots reaccionan a `table:state`, pero el broadcast inicial de la partida ocurre
     ANTES de adjuntar los bots → se quedaban esperando. Solución: tras adjuntar bots, re-emitir
     `table:join` (fuerza un broadcast del estado actual y arranca al jugador en turno).
   - **"pump"**: un bot con flag `busy` que ignora eventos mientras espera un ack **pierde** el estado
     siguiente si llega durante ese lapso (pasó en Póker: se perdía el evento del flop). Solución:
     guardar el último estado (`latest`) y, al terminar, reprocesarlo (`pump()`).
   - El Hub emite **doble broadcast** por acción (el engine llama `notify()` y `hub.action` también
     hace `broadcast`). Es benigno (estados idempotentes) pero explica logs duplicados.
   - `table:leave` no devuelve ack: un `await emit('table:leave')` cuelga para siempre → en tests usar
     emisión directa o un `emit` con timeout.
10. **Lint de Next.js:** apóstrofo sin escapar (`Hold'em`) → usar `&apos;`. Y cuando **todas** las
    entradas de `GAMES` tienen `href` (string), TS marca la rama "sin href" como `never` → se simplificó
    `game-cards.tsx` para usar siempre `<Link>`.
11. **Rate limit rompía la suite de tests** (corren desde una IP) → los limiters tienen
    `skip: () => NODE_ENV !== 'production'` (solo aplican en prod).
12. **Memoria 256→512MB** (Node+Prisma+Socket.IO+pokersolver arriesga OOM con 256). El plan free de
    Render ya da 512MB.
13. **Cambio de host Fly.io → Render** (jun 2026): Fly.io eliminó el free tier (pide tarjeta + trial
    de horas); además la tarjeta prepagada del dueño (Zinli) fue rechazada — Fly/Stripe no aceptan
    prepagadas. Se migró a **Render** (free, sin tarjeta, soporta WebSockets). Se reemplazó `fly.toml`
    por `render.yaml` (Blueprint en la raíz) y se reescribió `DESPLIEGUE.md`. Render free **duerme tras
    15 min sin tráfico** pero los mensajes WS lo mantienen vivo mientras haya partidas; el dinero está
    a salvo en Neon. La app ya escuchaba en `process.env.PORT` (Render lo inyecta solo), así que no
    hubo cambios de código salvo comentarios.
14. **Render SÍ pide tarjeta para desplegar** (jun 2026, vía Stripe): aunque el plan es free ($0/mes),
    exige verificar una tarjeta con una autorización temporal de $1 (no cobra). La **Zinli (prepagada)
    también fue rechazada aquí** (el formulario se borra y reaparece = decline). Se resolvió con una
    **Visa de banco real (no prepagada)** que sí pasó. Conclusión: cualquier host con Stripe (Render,
    Fly) rechaza prepagadas; hace falta tarjeta real, o un host 100% sin tarjeta (Koyeb/Back4app).
15. **Render no encontraba el repo tras conectar GitHub** (la app de GitHub se instaló pero el panel
    seguía vacío). Atajo que funcionó: pestaña **"Public Git Repository"** → pegar la URL del repo
    (es público) → saltó toda la conexión de la GitHub App.
16. **Deploy manual (no Blueprint) en Render:** *New + → Web Service* (el Blueprint disparaba el
    cobro/tarjeta antes). Config: runtime **Docker**, **Root Directory `server`**, Dockerfile Path por
    defecto (`./Dockerfile`), branch `main`, Region **Virginia (US East)** (misma que Neon), plan
    **Free**. Variables: botón **"Add from .env"** las carga de golpe; OJO **borrar la fila vacía**
    `NAME_OF_VARIABLE` (queda como "Required" y bloquea el deploy) y **no incluir `PORT`** (Render lo
    inyecta). Logs de éxito: `✅ Conectado a PostgreSQL`, `🚀 ... escuchando ...:10000`, `Your service
    is live`.
17. **Vercel — variables `NEXT_PUBLIC_*`:** añadir `NEXT_PUBLIC_API_URL` y `NEXT_PUBLIC_SOCKET_URL` =
    `https://betmarplay-server.onrender.com`, **apagar el toggle "Sensitive"** (son públicas, van al
    bundle del navegador; marcarlas sensibles puede romper el build) y hacer **Redeploy** para que las
    tome. Sin el redeploy, producción seguía apuntando a `localhost`.

---

## 9. Comandos clave

```bash
# Backend (server/)
npm install
npm run dev            # http://localhost:4000  (health: /health)
npm run typecheck      # tsc --noEmit (siempre en verde)
npm run build          # tsc -> dist/  (artefacto de producción)
npm run db:diff        # genera prisma/init.sql desde el esquema
npm run db:apply       # aplica init.sql a Neon por 443
# Suite e2e (con el server vivo en otra terminal):
npx tsx scripts/test-auth.ts wallet realtime bingo domino poker admin  # (uno por uno)

# Frontend (vegasve/)
npm install
npm run dev            # http://localhost:3000
npm run build          # DEBE quedar en verde antes de subir

# Para conectar a la DB desde Bash en este entorno: usar dangerouslyDisableSandbox=true
```

**Probar un juego en local:** levantar `server` y `vegasve`, abrir 2 navegadores (o ventana normal +
incógnito), registrar 2 usuarios, darles saldo (depósito + aprobar en `/admin` con el usuario admin),
y entrar a la misma sala/mesa.

---

## 10. Estado de git (sesión)

`main` (remoto y local) en `89d949a`. Commits de la sesión, en orden:
- `ca31e15` Módulos 0-2 (infra, auth, billetera) + docs
- `e57bf9d` Módulo 3 (núcleo tiempo real)
- `83420ca` Módulo 4 (Bingo)
- `d732ec4` Módulo 5 (Dominó)
- `6861f75` Módulo 6 (Póker)
- `634a1b2` Módulo 7 (Admin)
- `89d949a` Módulo 8 (hardening + deploy + docs)

Secretos NUNCA commiteados: `server/.env` y `vegasve/.env.local` están en `.gitignore` (se verificó
en cada commit que no entraran `.env`/`node_modules`/`dist`).

---

## 11. Pendientes y acción del usuario

- **Desplegar** (lo hace el dueño): `server/DESPLIEGUE.md` (Render: New+ → Blueprint → repo → pegar
  secretos; luego Vercel `NEXT_PUBLIC_API_URL`/`NEXT_PUBLIC_SOCKET_URL` + Redeploy).
- 🔒 **Rotar** el token de GitHub usado en la sesión (quedó en el chat) y la **contraseña de Neon**
  (también se compartió). Tras rotar Neon: actualizar `server/.env` y el secreto en Render.
- **Fase 2:** Parley y Caballos (siguen como prototipo hardcodeado).
- **Producto regulado (fuera de código):** licencia de juego, KYC/AML, juego responsable, RNG
  certificado. El software está; lo legal/regulatorio no.
- **Mejoras técnicas anotadas:** llenar `GameRound/GameResult` para estadísticas; adaptador Redis si
  se escala Socket.IO a varias instancias (hoy el estado vive en memoria, 1 sola instancia en Render);
  endurecer auth a cookies httpOnly. (El auto-pass/auto-fold por timeout YA está hecho — ver §12.)

---

## 12. Lecciones para futuras sesiones (TL;DR)

- **La DB se usa por 443 con el driver de Neon.** No intentes `prisma db push` aquí; usa `db:diff`+`db:apply`.
  Para conectar desde Bash: `dangerouslyDisableSandbox`.
- **Dinero = céntimos BigInt, siempre por `applyLedger`** dentro de transacción. Hay tests que verifican
  el invariante; corre la suite tras tocar dinero.
- **Los juegos son server-authoritative**; el cliente solo muestra `table:state`.
- **Tests de juego:** usa los patrones "kick" (re-join para arrancar) y "pump" (reprocesar último estado).
- **Antes de subir:** `npm run build` del frontend en verde; `tsc --noEmit` del backend en verde.
- **No pushear el frontend a `main`/producción** sin que el backend esté desplegado y Vercel tenga
  `NEXT_PUBLIC_API_URL`, o rompes el login en vivo.
- **El push necesita un PAT del dueño** (no hay credenciales en el entorno; no está en CLAUDE.md).

---

## 12. Mejoras de jugabilidad y UX (14/06/2026)

Tras el deploy, ronda de mejoras pedidas por el dueño (todo verificado: 110/110 e2e + 9/9 práctica):

1. **Overlay "servidor despertando"** (`vegasve/lib/server-status.ts` + `components/server-wake-overlay.tsx`):
   el plan free de Render duerme tras 15 min; si una petición tarda >4s o el socket no conecta (confirmado
   con `/health`), se muestra un overlay "Preparando la mesa…" que se quita solo al revivir. Enganchado en
   `lib/api.ts` (timer + catch de red) y `lib/socket.ts` (connect/connect_error).
2. **Temporizador de turno + auto-acción** (dominó y póker): cada motor tiene `turnTimeoutMs` (25s real),
   `syncTurnTimer()`/`onTurnTimeout()`; al agotarse, dominó juega 1.ª ficha legal o pasa, póker hace
   check si puede o fold. Timers con `unref()`. Expone `turnEndsAt` → `components/turn-timer.tsx`
   (cuenta regresiva). Arregla el congelamiento de dominó por desconexión.
3. **Practicar vs CPU** (lo más grande):
   - **Escrow inyectable** en `src/realtime/escrow.ts`: interfaz `Escrow`, `realEscrow` (ledger) y
     `practiceEscrow` (no-op, saldo infinito). Los 3 motores reciben `escrow` (default real) → mesas de
     práctica no tocan dinero real. Motores ahora tienen `dispose()` para limpiar timers.
   - **Bots** en `src/realtime/bots.ts`: `BotController` (programa acciones con retraso 0.7–1.9s tras
     cada cambio de estado) + deciders por juego. Hub: `Member.bot`, `Table.practice`/`bots`, `addBot()`,
     arranque al unirse el humano, **autodestrucción** de la mesa al irse/desconectarse el humano
     (`cleanupPractice` + `removeTable` → `engine.dispose()`).
   - `src/games/practice.ts` (`createPracticeTable`) + evento socket `table:practice`.
   - Verificado con `scripts/smoke-practice.ts` (los CPU juegan y la partida avanza en los 3).
4. **Reconexión en el frontend:** las 3 páginas escuchan `table:rejoinable` y vuelven a la mesa al
   refrescar (el backend ya conservaba el asiento).
5. **Sonidos + animaciones:** `vegasve/lib/sfx.ts` (Web Audio sintetizado, sin archivos) +
   `components/sound-toggle.tsx` (silencio persistido, desbloquea audio en 1.er gesto); animaciones CSS.
6. **Chat de mesa en vivo:** `Hub.chat()` (últimos 30, historial al unirse vía `table:messages`),
   evento `table:chat`, `components/table-chat.tsx` en los 3 juegos. + ajustes móviles + filtros del
   historial del perfil (Todo/Pagos/Juegos).

**Gotcha resuelto:** un test de realtime ("A ve el count por acción de B") capturaba "el próximo
`table:state`"; al añadir el broadcast del historial de chat al unirse, a veces atrapaba el estado de la
unión (count 0). Fix: esperar el estado con `count===1` (determinista), no "el próximo".

---

## 13. Cuentas (Google + foto), rediseño visual y extras (14/06/2026)

**Login con Google (código listo, PENDIENTE de activar):**
- Backend `POST /auth/google` (`src/auth/service.ts:loginWithGoogle`): verifica el ID token con
  `google-auth-library` (`OAuth2Client.verifyIdToken`, audience = `GOOGLE_CLIENT_ID`), crea/recupera el
  usuario (passwordHash aleatorio, sin contraseña usable). `GOOGLE_CLIENT_ID` opcional en `env.ts`.
- Frontend: Google Identity Services en `components/google-signin.tsx` (carga el script GSI, renderiza
  el botón, manda el `credential` a `/auth/google`); integrado en `auth-dialog.tsx`. `auth-context` tiene
  `loginWithGoogle`. Si falta `NEXT_PUBLIC_GOOGLE_CLIENT_ID`, el botón muestra "pronto".
- **Bloqueo externo:** la cuenta `betmarplay@gmail.com` está en revisión por Google → no se pudo crear el
  OAuth Client ID. Al reactivarse: crear cliente OAuth web (orígenes JS = vercel.app + localhost:3000),
  copiar el Client ID, ponerlo en `NEXT_PUBLIC_GOOGLE_CLIENT_ID` (Vercel) y `GOOGLE_CLIENT_ID` (Render).

**Foto de perfil:**
- `User.avatarUrl String?` añadido al esquema. La columna se añadió a Neon con `server/prisma/add-avatar.ts`
  (`ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;` por 443) — **patrón para añadir columnas
  sin romper** (`db:diff` regenera el esquema completo, NO sirve para columnas sueltas). `PATCH /auth/avatar`
  valida data URL de imagen ≤ 90 KB. Front: subida en `/profile` (redimensiona a 220px con canvas →
  JPEG data URL), avatar mostrado en perfil y navbar. **⚠️ Orden:** primero la columna, luego desplegar
  (si no, el backend nuevo consulta una columna inexistente y rompe login). Render hace `prisma generate`
  en su build, así que el cliente desplegado sí tiene `avatarUrl` aunque el local quede sin regenerar.

**Rediseño visual de los juegos (en curso — Dominó primero, los otros pendientes):**
- `components/domino-piece.tsx`: ficha con **puntos reales** (rejilla 3×3 por mitad), orientación v/h y
  cara oculta (dominó de espalda marfil, NO carta).
- **Todo en un recuadro** `.game-stage` (mesa + mano + acciones), alto/cuadrado. El tablero es **una sola
  línea conectada que se auto-escala** para caber (sin scroll ni filas sueltas): `reconcileBoard` da ids
  estables (solo la ficha nueva se anima), `fitBoard` mide y aplica `transform: scale` (felt `overflow:hidden`).
- **Chat flotante** (`components/table-chat.tsx`): botón en esquina; cerrado, mensajes nuevos salen como
  burbujas tipo notificación (3 s) + contador; clic abre el panel. Compartido por los 3 juegos.
- Sonido `place` = **clack de madera** (ruido filtrado + golpe grave, `sfx.woodClack`); póker usa `sfx.card()`.
- Bingo: tablero 1-75 que se ilumina + bola 3D. Póker: mesa ovalada. (Falta subir póker/bingo al nivel de Dominó.)

**Extras:** `components/fullscreen-toggle.tsx` (pantalla completa, PC+Android, global en el layout).
Práctica de Dominó cambiada a **4 jugadores (parejas)** en `src/games/practice.ts` (verificado smoke 9/9).

**Iteración de UX (lecciones, blind):** el tablero pasó por scroll horizontal → wrap en filas (ambos
se veían feos) → **línea única auto-escalada** (la que funcionó). Construido sin ver el render: cada pase
se desplegó y se afinó con capturas del dueño.

## 14. Pulido del Dominó (mesa, móvil, tablero en serpiente, fichas) (15/06/2026)

Sesión larga de iteración visual del **Dominó** (todo afinado con capturas del cliente). Resumen:

**Jugadores alrededor de la mesa** (`app/domino/page.tsx` + `.dom-table-area` en `globals.css`):
- Grid: compañero **arriba**, rivales **izquierda/derecha**, yo **abajo** (la mano). `seatPos(offset,total)`
  usa el offset del asiento relativo al mío (`mySeat`). Etiqueta de nombre cuadrada-redondeada con `…`.
- Se quitó el sub-texto "X fichas · Pareja Y" (redundante y mostraba "Pareja 3"). "Esperando jugadores"
  solo aparece si faltan (<2); si ya están, solo el botón Iniciar.

**Recuadro/HUD:** `.game-stage` más ancho en PC (`min(1180px,96vw)`). «Tus fichas» y «Es tu turno · Xs»
anclados en las **esquinas** del área de mano. **Botón Pasar superpuesto**: cuando `mustPass`, una capa
(`.hand-pass-veil`) oscurece las fichas y el botón queda centrado encima. Mano en **una sola fila** (nunca
2 filas). Stats en celular en **rejilla 2×2** (no se desbordan). «extremos X y X» oculto en celular.

**Chat flotante:** se cierra al **tocar fuera** (PC y celular) con un `.chat-backdrop` (capa invisible).
Iconos del chat/sonido/pantalla-completa pasaron de **emoji a SVG** (`components/icons.tsx`: Chat, SoundOn/Off,
Expand/Compress, Cpu, Trophy).

**Pantalla completa SOLO del juego** (`components/stage-fullscreen.tsx`, reemplaza al global
`fullscreen-toggle.tsx` que se borró):
- PC/Android: Fullscreen API sobre el `.game-stage`.
- **iPhone/Safari NO permite** pantalla completa de un `<div>` (solo video) → **fullscreen simulado**:
  `position:fixed` que cubre la pantalla. ⚠️ `body{overflow:hidden}` **rompe** los `position:fixed` en iOS
  (bug de Safari) → NO usarlo. El botón de salir va `fixed` + `env(safe-area-inset-*)` para no quedar bajo
  el notch ni desplazarse con el scroll.

**Modo inmersivo horizontal en celular** (lo pidió el cliente):
- En celular, al estar en una mesa, el `.game-stage` toma toda la pantalla y, **en vertical, se gira 90°
  por CSS** (`transform: rotate(90deg)` + `width/height` con **`dvw/dvh`** —NO `vw/vh`, que en iPhone
  incluyen las barras del navegador y cortan el contenido). En horizontal real solo ocupa la pantalla.
- iOS no deja **forzar** la orientación; el truco CSS lo resuelve. Se oculta nav/ticker/sonido; el
  `<TableChat>` se movió **dentro** del `.game-stage` (un ancestro con `transform` ancla sus hijos
  `position:fixed` a él → el chat queda bien dentro del juego girado). Botón **Salir** dentro.

**Tablero en SERPIENTE que dobla en L** (lo más importante; varias iteraciones — `computeSnake` en
`app/domino/page.tsx`):
- Motor propio: recorre la cadena con un cursor que avanza horizontal y, al no caber contra el borde,
  coloca la ficha **vertical (esquina en L)**, baja una fila y sigue en sentido contrario (no son filas
  tipo "procesador de texto"; cada ficha se posiciona en **absoluto** según la geometría de la anterior).
- **Coincidencia número con número:** el motor del backend mantiene el invariante **`board[i].b ===
  board[i+1].a`**. Por eso, tramo a la **derecha** se muestra `[a|b]`, a la **izquierda** invertido `[b|a]`,
  y la **esquina** vertical con `a` arriba (conecta con la fila de arriba) / `b` abajo.
- Geometría: se **mide** el tamaño real de la ficha con `offsetWidth/offsetHeight` (ignoran `transform`;
  estimar con padding/márgenes del divisor fallaba y las fichas se montaban). `rowDrop = L - S/2 + 4` da
  separación sin choques (las dobles sobresalen perpendiculares sin pisar la fila siguiente). `reserve`
  guarda el hueco de la esquina al final de la fila.
- **Tamaño FIJO** (no se aleja la vista): se quitó el `fitBoard`/escala. Bloque centrado; transición suave
  al reacomodarse.

**Perspectiva de cámara:** `.dom-chain { transform: perspective(820px) rotateX(22deg) }` inclina el tablero
hacia el jugador (al cliente le gustó). No requiere rehacer los SVG.

**Fichas — historia (el cliente cambió de opinión):** plana → SVG con puntos redondos (`<circle>`, no
`<div>` con % que se deformaban) → 3D con canto/bisel → **de vuelta a PLANAS 2D y más grandes** (decisión
final): `.dom-tile` marfil con sombra sutil, puntos **sólidos** (`PIP_COLOR`), divisor fino. Tamaños
subidos. El **borde verde de selección** usa `::after` con `border-radius` (sigue la forma redondeada;
antes `outline` se veía rectangular).

**Límite de 1 mesa por usuario** (backend, evita choque entre dispositivos): `Hub.findUserTable` /
`busyTable` (`src/realtime/hub.ts`); `join` y `table:practice` rechazan si ya hay otra mesa con aviso
("Ya tienes una partida abierta (quizá en otro dispositivo)…"). El re-join a la **misma** mesa sí se permite.

**Bug del perfil (.pcard):** el perfil se veía como una "cajita blanca". Causa: **colisión de clase** —
`.pcard` se usaba para la tarjeta del perfil **y** para la carta de póker (46×64 blanca, regla global que
pisaba). Solución: la carta de póker pasó a **`.pkcard`** (`app/poker/page.tsx` + reglas en `globals.css`).

**Overlay "servidor despertando" mejorado** (`lib/server-status.ts`, `components/server-wake-overlay.tsx`):
`prewarmServer()` hace ping a `/health` al abrir la web (despierta Render antes), botón **"Reintentar ahora"**
y, a los 60 s, **"Recargar página"**. Recordatorio: en Render free **cada push redepliega el backend** (~2–4
min) y duerme tras 15 min → el overlay puede aparecer al probar justo después de subir. (Opción no aplicada:
**Build Filters** en Render para que solo redepliegue con cambios en `server/`.)

**Lecciones nuevas:**
- iOS Safari: sin Fullscreen API para `<div>`; `body{overflow:hidden}` rompe `fixed`; usar `dvw/dvh`.
- Un ancestro con `transform` reancla los `position:fixed` descendientes (útil: chat dentro del tablero girado).
- Para layouts pixel-exactos de fichas: **medir** con `offsetWidth/Height`, no estimar.
- El motor de dominó ya entrega la cadena con `board[i].b===board[i+1].a` → orientar por dirección basta.
- Colisiones de nombres de clase CSS entre módulos (`.pcard`) → usar prefijos por feature.

## 15. Bingo "Royale" + ⚠️ caída del backend en cada push y "Load failed" en iPhone (17-18/06/2026)

**Rediseño visual del Bingo** (`app/bingo/page.tsx` + `globals.css`), al nivel del Dominó, **sin tocar el
backend ni la economía** (sigue siendo multijugador con pozo; el primero en hacer línea gana; 18/18 e2e):
- Todo en un **`.game-stage`** (fieltro + marco), barra de stats, **modo inmersivo** en celular y
  **pantalla completa** del juego (reusa `StageFullscreen` + chat flotante del Dominó).
- **Cartones 5×5 PRO:** cabecera B-I-N-G-O de colores, casilla marcada con **sello/dab** animado, espacio
  libre ★, resaltado de la **línea ganadora** y aviso **"¡Te falta 1!" / "¡LÍNEA!"** (se calcula en el
  cliente con `bestLine()` a partir de `grid`+`marked`; no hizo falta tocar el backend).
- **Bombo 3D** (`BingoMachine`, `<canvas>` sin librerías): ~34 bolas de colores con física 2D (gravedad +
  turbulencia = "aire comprimido", rebote en la esfera) y **soplo extra** al salir cada bola (`boostRef`).
  Se **eliminó** la tabla 1-75 y el historial de cantados (el cartón se marca solo; la gente solo quiere ver
  el número que sale). Cartones **más pequeños** para que **los 4 entren sin scroll** en pantalla completa.
- Nombres de los otros jugadores **movidos al panel del cantor** (antes quedaban sueltos abajo).

**⚠️⚠️ EL ERROR DE ESTA SESIÓN — leer siempre antes de empujar frontend:**
`render.yaml` tenía `autoDeploy: true` **sin filtro de rutas** → **CADA push a `main` (aunque fuera solo de
`vegasve/`) redesplegaba el backend en Render** (~2-4 min caído + pierde estado en memoria). Al hacer varios
pushes seguidos del Bingo, el backend estuvo reiniciándose una y otra vez y **parecía que "el Bingo rompió
el login"**, cuando en realidad era el servidor reiniciándose. **Fix:** se añadió `buildFilter` al
`render.yaml` (`paths: [server/**, render.yaml]`, `ignoredPaths: [vegasve/**, **/*.md]`). Tras aplicarlo,
los pushes de frontend ya **no** tumban el backend. (Alternativa equivalente sin push: panel de Render →
Settings → **Build Filters** → Included Paths `server/**`.) ⚠️ El push que activa el `buildFilter` SÍ provoca
**un último** redeploy; hacerlo en un momento tranquilo.

**"Load failed" al loguear en iPhone (con PC funcionando) — playbook de diagnóstico:**
1. **PC "funciona" porque usa el backend LOCAL** (`.env.local` → `localhost:4000`); no pasa por Render. No
   es comparación válida con producción. Para comparar de verdad, abrir producción en ambos.
2. Comprobar el servidor REAL (no asumir que está dormido):
   `curl -s https://betmarplay-server.onrender.com/health` → debe dar `{"ok":true,...}` rápido.
3. Comprobar **CORS y cabeceras** que el navegador exige y `curl` ignora:
   `curl -D - -H "Origin: https://plataforma-apuestas.vercel.app" .../health` → debe traer
   `access-control-allow-origin` con ese origin. Preflight: `curl -X OPTIONS -H "Origin: ..."
   -H "Access-Control-Request-Method: POST" .../auth/login` → `204` con allow-methods/headers.
   Ojo con **CORP/COEP** de helmet: tenemos `crossOriginResourcePolicy:false` (correcto; si fuera
   `same-origin` bloquearía el `fetch` cross-origin aunque el CORS esté bien). `COOP` no afecta a `fetch`.
4. Verificar la **URL embebida** en el bundle de producción (que NO sea `http://localhost:4000` por falta de
   `NEXT_PUBLIC_API_URL`/`_SOCKET_URL` en Vercel): bajar los chunks de `/_next/static/chunks/*.js` y
   `grep` por `onrender`/`localhost`. (En esta sesión salió `https://betmarplay-server.onrender.com` ✅.)
5. Si **todo lo anterior está OK** pero el iPhone abre `/health` directo y la **app** falla, suele ser una de
   dos: (a) **el backend estaba caído/frío** justo en ese momento (redeploy en curso o cold start), o (b)
   caché/ajuste local del Safari. **Test partidor:** abrir en **pestaña privada**. ⚠️ Ojo con el falso
   positivo: si en privado entra **y luego en normal también entra SIN borrar caché**, NO era caché → era (a)
   transitorio (el server terminó de despertar entre un intento y otro). Si solo entra en privado y en normal
   sigue fallando hasta **borrar Datos de sitios web** (Ajustes → Safari → Avanzado → Datos de sitios web →
   *vercel*), entonces sí era caché. Si no entra ni en privado → desactivar **iCloud Private Relay**, **Modo
   de aislamiento (Lockdown)** y **bloqueadores de contenido**; probar **Wi-Fi ↔ datos**.

**CAUSA CONFIRMADA en esta sesión (18/06):** era **(a)** — el backend estaba terminando de redeployar/despertar
durante los intentos. El incógnito "funcionó" por coincidencia de tiempo (el server acabó de encender) y luego
el modo normal **también funcionó sin borrar caché**. No era caché ni un ajuste del iPhone. La cura definitiva
es el `buildFilter` (que los pushes de frontend dejen de reiniciar el backend) + esperar a que termine el cold
start cuando sí toque redeploy de `server/`.

**Lecciones nuevas:**
- **`autoDeploy` sin `buildFilter` = el backend se redeploya con CUALQUIER push** → siempre poner build
  filter cuando front y back viven en el mismo repo (monorepo).
- "Load failed" en iOS Safari = `TypeError` genérico de `fetch` (CORS, red, contenido mixto o caché). El
  `curl` no reproduce CORS/CORP/caché → **siempre** verificar con `Origin` y con pestaña privada.
- Una navegación directa a un endpoint **no** usa CORS; el `fetch` de la app **sí** → que uno funcione y el
  otro no apunta a CORS/origin/caché, no a "servidor caído".
- Animaciones tipo bombo: `<canvas>` + `requestAnimationFrame` con física simple basta; no hace falta 3D real.

## 16. Rediseño PRO de los 5 juegos + móvil horizontal global (18/06/2026)

Sesión nocturna autónoma. **Casi todo frontend**; el único cambio de backend es subir el límite de cartones.

**Bingo — 6 cartones en filas de 3:** `MAX_CARTONES_PER_PLAYER` 4→6 (`server/src/games/bingo/engine.ts`).
Frontend: `.bingo-cards .bingo-cartones { grid-template-columns: repeat(3, minmax(0,200px)) }` (n1→1, n2→2),
contador `/6`, límite de compra 6. Cartones compactos para que los 6 entren sin scroll en pantalla completa.

**Móvil horizontal forzado en TODOS los juegos de mesa:** se **generalizó** el modo inmersivo del Dominó.
Las reglas estructurales (`position:fixed`, rotate 90° en portrait con `dvw/dvh`, full en landscape, y los
`@supports (height:100dvh)`) ahora listan los **tres** selectores: `.game-stage.dom-immersive`,
`.bingo-immersive`, `.pk-immersive`. Cada juego añade su clase y el `immersive = isMobile && tableId && game`
+ `body.immersive-on`. Compactación específica por juego (`.bingo-immersive .xxx`, `.pk-immersive .xxx`).
⚠️ El `@media (max-width:920px){ .bingo-arena{1fr} }` se sobreescribe en inmersivo con `.bingo-immersive
.bingo-arena{ 2 columnas }` (más específico) para mantener bombo+cartones lado a lado en el giro.
(Caballos/Parley NO se fuerzan a horizontal: son listas de apuestas, no mesas; van como páginas normales.)

**Póker PRO** (`app/poker/page.tsx` + `.pk-*` en `globals.css`; backend Texas Hold'em intacto):
- Mesa **ovalada** (`.pk-felt`, `border-radius:50%/44%`) dentro de `.game-stage`. Asientos **alrededor de la
  elipse** con posición calculada en JS: `seatStyle(offset,total)` → `a=π/2+(offset/total)·2π`,
  `x=50+46·cos a`, `y=50+45·sin a` (offset 0 = yo, abajo). `offset=((idx-mySeat)%n+n)%n`. Cada `.pk-seat` es
  `position:absolute; transform:translate(-50%,-50%)` sobre `.pk-table-wrap`.
- Cartas comunitarias + `.pk-pot` al centro, **dealer button** (`.pk-dealer`), **ficha de apuesta** por
  asiento (`.pk-bet`), cartas del héroe más grandes (`.pkcard.big`), timer de turno, estados folded/all-in.
- Barra de acciones `.pk-actionbar` con **slider** de subida (range, step = ciega grande). Showdown en
  `.stage-winner`. Inmersivo horizontal + chat. (Se renombró el slider de número a range.)

**Caballos y Parley — UI PRO + login + saldo real, SIN backend de dinero (a propósito):**
- Antes eran **prototipos de solo-frontend** (saldo falso `Bs. 12.480`, sin `AuthGuard`). Ahora: `AuthGuard`
  + saldo real (`useAuth` → `formatBs(user.balance)`), visual consistente (`.hp-*` hípica, `.sb-*` deportes,
  `.seg-tabs`, `.soon-pill`).
- **Caballos** estilo Cordialito: pestañas **Carrera** (Ganador/Place/Show con cuotas por caballo+jinete) y
  **Polla Hípica** (puntos 5/3/1), slip con ganancia potencial.
- **Parley**: partidos con cuotas 1/X/2, **acumulador** (multiplica cuotas) con ganancia potencial.
- ⚠️ **Decisión de diseño (importante):** NO se desplegó backend de dinero real para estos dos juegos. Crear
  y **desplegar sin probar** un motor de apuestas/liquidación que mueve el ledger, de noche y a ciegas, es un
  riesgo alto e irreversible. El botón de apostar muestra "en preparación". Activar dinero real requiere
  **decisión del cliente sobre la fuente de datos** (ver más abajo) y luego construir+probar el backend.

**Investigación (para decidir):**
- **Cordialito** (cordialito.la) = mayor casa de apuestas de Venezuela. Hípica: **Polla Hípica** (acumular
  puntos en las últimas carreras válidas) + apuestas **directas win/place/show**, combinadas y de sistema;
  5y6 La Rinconada/Valencia. Hipódromos: La Rinconada, Valencia, Rancho Alegre.
- **Parley/odds gratis:** The Odds API, API-Football, Sports Game Odds, The Rundown tienen **tier gratis**
  pero con límites de requests, requieren clave/registro y su TOS suele restringir uso comercial de apuestas.
- **Recomendación para presupuesto cero:** modelo **admin-curado** (el admin crea eventos+cuotas y liquida
  en `/admin`; gratis, sin dependencia externa) para Parley; **virtual RNG** (carreras instantáneas decididas
  por el servidor, estilo virtual sports) para Caballos. Ambos reutilizan el ledger/escrow ya probado.

**Lecciones nuevas:**
- Generalizar features (modo inmersivo) listando varias clases en el selector evita tocar páginas que ya
  funcionan (menos riesgo que refactorizar a una clase compartida).
- Colocar asientos en elipse: trig con offset relativo al jugador, `translate(-50%,-50%)` sobre un contenedor
  relativo; radios <50% para no desbordar.
- No desplegar código de dinero real **sin probar** en una sesión autónoma; dejar la UI lista y **marcar la
  decisión** del cliente. La fuente de datos de apuestas deportivas/hípicas es una decisión de producto
  (gratis admin-curado vs API de pago), no algo que se resuelva en código.
