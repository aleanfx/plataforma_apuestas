# BetmarPlay — Guía de Continuidad / Contexto del Proyecto

> **Léeme primero.** Este documento es el "estado de la verdad" para retomar el proyecto en
> una sesión nueva sin contexto previo. Resume QUÉ es, CÓMO está construido, DÓNDE está cada
> cosa, CÓMO se despliega y QUÉ falta. Última actualización: **15 de junio de 2026**.
>
> **🔧 NOVEDAD (jun 2026): ya hay BACKEND.** El proyecto dejó de ser solo-frontend. Hay un
> backend real en [`../server/`](../server/) (Node/TS + Express + Socket.IO + Prisma + Neon).
> **Auth y billetera ya son reales** (Módulos 0-2 completos); los 3 juegos en vivo están en
> construcción. Resumen de avance en [`../ESTADO.md`](../ESTADO.md). Las secciones de abajo que
> dicen "sin backend / hardcodeado" describen el punto de partida; ver §13 para lo nuevo.

---

## 1. Qué es

**BetmarPlay** es un **frontend** (sin backend) de una plataforma de casino y apuestas para
Venezuela. Es un **prototipo visual/interactivo**: la navegación, modales, juegos nuevos y
avisos (toasts) funcionan en el cliente, pero **no hay servidor, base de datos, autenticación
real ni pagos reales**. Todos los datos (saldos, nombres, partidos, carreras, usuarios) están
**hardcodeados**.

- **Repo:** https://github.com/aleanfx/plataforma_apuestas
- **Producción (Vercel):** https://plataforma-apuestas.vercel.app — **se despliega solo desde la rama `main`**.
- **IMPORTANTE:** el proyecto Next.js NO está en la raíz del repo, está en la subcarpeta **`vegasve/`**.
  Todos los comandos (`npm ...`) se ejecutan dentro de `vegasve/`.

## 2. Stack

- **Next.js 14** (App Router) + **TypeScript** + **Tailwind CSS** + primitivas **shadcn/ui** (Radix).
- Notificaciones: **sonner** (toasts).
- Salida **estática (SSG)**: `npm run build` prerenderiza todas las rutas.
- Tema visual: **galaxia / neón** sobre `#0d0b1e` (morado, cyan, rosa, naranja, dorado), con
  nebulosa + estrellas hechas en CSS puro. Tipografías: Outfit (display), Jost (texto),
  Dancing Script (script). Todo el diseño vive en **`app/globals.css`** (tokens + componentes
  + responsive).

## 3. Rutas / páginas (`app/`)

| Ruta         | Archivo                  | Qué es |
| ------------ | ------------------------ | ------ |
| `/`          | `app/page.tsx`           | Landing (sesión cerrada): hero 3D, **los 5 juegos + 5 "Pronto"**, features, footer. Las tarjetas invitan a registrarse. |
| `/lobby`     | `app/lobby/page.tsx`     | Lobby (sesión iniciada): saludo, banner de saldo, **mismos 10 juegos**, footer. |
| `/bingo`     | `app/bingo/page.tsx`     | Juego Bingo: cartón 5×5, generar/cantar/comprar, números cantados animados. |
| `/parley`    | `app/parley/page.tsx`    | Parley: 5 partidos con cuotas, acumulador, ganancia potencial. |
| `/caballos`  | `app/caballos/page.tsx`  | Pollas hípicas: 3 carreras × 6 caballos, puntos (1ro=5, 2do=3, 3ro=1), sellar polla. |
| `/profile`   | `app/profile/page.tsx`   | Perfil: identidad, stats, saldo, historial. |
| `/admin`     | `app/admin/page.tsx`     | Panel admin: métricas, usuarios, cola de aprobaciones, juegos. **Sin protección de auth.** |

Infra de `app/`: `layout.tsx` (fuentes, metadata/SEO, Toaster), `icon.png` (favicon generado
del logo), `globals.css`, `not-found.tsx` (404), `error.tsx` (error boundary), `robots.ts`
(bloquea `/admin` y `/profile`), `sitemap.ts`.

## 4. Componentes clave (`components/`)

| Archivo               | Qué hace |
| --------------------- | -------- |
| `site-nav.tsx`        | Navbar. Variante **`out`** (landing: enlaces + Ingresar/Registrarse) y **`in`** (logueado: un solo enlace **"Inicio" → /lobby**, chip de saldo, avatar). Logo desde `/logo.png` con respaldo a texto. |
| `site-footer.tsx`     | Footer reutilizable (logo + texto legal + métodos de pago). Usado en landing y lobby. En móvil los pagos pasan en **marquee** de una línea. |
| `game-cards.tsx`      | **Fuente única de los juegos.** Arrays `GAMES` (5 disponibles) y `SOON` (5 próximamente). `LandingGameCards` (abre registro) y `LobbyGameCards` (enlaza/abre el juego). Tarjetas con foto de fondo (`cardBg`). |
| `hero-art.tsx`        | Cartas + dominó 3D animados del hero. |
| `auth-dialog.tsx`     | Modal login/registro (Radix Dialog + Tabs). Solo social **Google** (Facebook fue removido). Inputs con validación nativa. |
| `wallet-dialog.tsx`   | Modal depósito/retiro. 5 métodos: **Criptomonedas, Binance, Pago Móvil, Daviplata, Nequi**. Valida monto mínimo/saldo. |
| `admin-actions.tsx`   | Botones aprobar/rechazar/suspender (solo toasts). |
| `ticker.tsx`          | Cinta de "ganancias en vivo" (datos ficticios). |
| `icons.tsx`           | Todos los iconos SVG (uno por export). |
| `ui/`                 | Primitivas shadcn: `dialog.tsx`, `tabs.tsx`, `sonner.tsx`. |
| `lib/utils.ts`        | helper `cn()`. |

## 5. Juegos y tarjetas (lo más editado)

Todo se define en **`components/game-cards.tsx`**:

- `GAMES` (5 disponibles): **domino, poker, bingo, parley, caballos**. Cada uno con
  `slug, Icon, name, desc, players, stakes, href, demo`.
- `SOON` (5 próximamente): **ruleta, blackjack, dados, tragamonedas, ludo**. Se renderizan
  como tarjetas de juego con **sello "Pronto"** y una **capa oscura + grayscale** que indica
  que aún no están disponibles.
- Ambos conjuntos (10 tarjetas) se muestran **igual en landing y lobby**, en una rejilla de
  **2 columnas en PC** (10 = simétrico, 5 filas) y como **carrusel deslizable en móvil**.

**Imágenes de fondo:** `public/games/<slug>.jpg` (una por tarjeta). Optimizadas a ~1280px de
ancho y ~55-95 KB. La función `cardBg(slug)` fija `background-size: cover/center` inline (en
móvil se perdía si solo iba por CSS). Si falta una imagen, queda un degradado de respaldo.
Para reemplazar una foto: mismo nombre `.jpg`. Ver `public/games/README.txt`.

## 6. Detalles de UX/CSS que ya se resolvieron (no re-romper)

- **Scroll de modales:** Radix (`react-remove-scroll`) bloquea el scroll fuera del
  `DialogContent`. Por eso el `DialogContent` usa `max-h-[88dvh]` + una capa interna
  `.modal-scroll` con `overflow-y-auto`. NO mover el scroll al contenedor padre. (Ver `components/ui/dialog.tsx`.)
- **Zoom de inputs en iOS:** los campos usan `font-size: 16px` en móvil (≤768px) para que iOS
  no haga zoom al enfocarlos.
- **Sin scroll horizontal en móvil:** `html, body { overflow-x: clip }`.
- **Carruseles en móvil** (juegos): `.games-grid` pasa a `display:flex` con scroll-snap.
  El "float" hover de las tarjetas se desactiva en táctil (`@media (hover: none)`) para que el
  carrusel no recorte el borde superior.
- **Features ("Hecho para jugar con confianza"):** en móvil son **3 recuadros en una línea**
  (grid 3 col), no carrusel.
- **Footer:** texto legal **al lado del logo** (`.footer-brand`); en móvil los métodos de pago
  son un **marquee** (`.pay-track` con grupo duplicado para bucle sin saltos).
- **Breakpoints:** `980px` (admin/tablet), `768px`, `560px`, `430px` (iPhone).
- **Páginas de juego** (bingo/parley/caballos): layout 2 columnas que colapsa a 1 en `≤900px`,
  con clases reutilizables `.game-layout / .game-panel / .game-side / .game-grid-5 / .game-grid-3 / .game-opt`.
- **Modo inmersivo horizontal (móvil) — COMPARTIDO por Bingo/Dominó/Póker:** las reglas estructurales
  (`position:fixed`, rotate 90° en portrait con **`dvw/dvh`** —no `vw/vh`—, full en landscape, `@supports
  (height:100dvh)`) listan los 3 selectores `.game-stage.dom-immersive, .bingo-immersive, .pk-immersive` en
  `globals.css`. Cada página activa `immersive = isMobile && tableId && game`, hace toggle de
  `body.immersive-on` y de su clase, oculta nav/ticker y muestra `<button.stage-exit>`. **Para añadir
  inmersivo a otro juego**, basta sumar su clase a esos selectores + la lógica en su página (no refactorizar).
- **Póker — asientos alrededor de la elipse:** `seatStyle(offset,total)` en `app/poker/page.tsx` calcula
  `left/top %` con trig (offset 0 = yo, abajo); `.pk-seat` va `position:absolute; translate(-50%,-50%)` sobre
  `.pk-table-wrap`. Radios <50% para no desbordar el óvalo.
- **Caballos/Parley** ya NO son prototipos sueltos: usan `AuthGuard` + saldo real (`useAuth`/`formatBs`). El
  botón de apostar dice "en preparación" **a propósito** (falta backend de liquidación + decisión de fuente
  de datos). No "arreglar" quitando ese aviso sin construir el backend.

## 7. SEO

`app/layout.tsx` define metadata completa (title template, Open Graph, Twitter, `metadataBase`).
`app/robots.ts` (permite todo salvo `/admin` y `/profile`) y `app/sitemap.ts` generan
`/robots.txt` y `/sitemap.xml`. La URL del sitio está hardcodeada en esos archivos
(`https://plataforma-apuestas.vercel.app`) — actualízala si cambia el dominio.

## 8. Desarrollo y build

```bash
cd vegasve
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción (debe quedar SIEMPRE en verde antes de subir)
npm run start    # servir el build
```

Convención: para añadir/quitar un juego se edita el array `GAMES` o `SOON` en
`components/game-cards.tsx`; para un juego con layout de dos columnas reutiliza las clases
`.game-layout` (ya responsivas). Mantén el estilo del código existente.

## 9. Git / despliegue (importante para sesiones remotas)

- **El git root es la raíz del repo** (`/.../plataforma_apuestas`), no `vegasve/`.
- Producción despliega desde **`main`**. Empujar a `main` un commit que sea fast-forward
  dispara el deploy de Vercel automáticamente.
- En el entorno remoto de Claude Code **no hay credenciales de escritura**: para `git push`
  se necesita un **Personal Access Token** de GitHub (scope `public_repo` basta, el repo es
  público). Se usa una sola vez en la URL y NO se guarda en la config:
  `git push "https://x-access-token:<TOKEN>@github.com/aleanfx/plataforma_apuestas.git" HEAD:main`
- Los commits aparecen como **"Unverified"** en GitHub (no hay clave GPG en el entorno). Es
  **cosmético**; no reescribir el historial ya publicado en `main` por eso (sería un
  force-push destructivo).
- A veces el usuario sube cambios (p. ej. imágenes) **directo a `main`** desde la web de
  GitHub. Antes de trabajar conviene `git fetch origin main` y `git rebase origin/main`.

## 10. Estado: ✅ hecho vs ⏳ pendiente

**✅ Hecho (frontend):** rebranding galaxia/neón; 5 juegos + 5 "Pronto" con foto; páginas
Bingo/Parley/Caballos; footer reutilizable (landing + lobby) con marquee de pagos; nav "Inicio";
modales con scroll correcto; validación de formularios; SEO (OG/robots/sitemap); 404 y error
boundary; favicon; fix de zoom iOS; responsive afinado; logout en rojo; métodos de pago con
nombres claros ("Criptomonedas").

**✅ Hecho (backend, Módulos 0-8 — MVP completo; ver `../ESTADO.md` y §13):**
1. **Auth real** (JWT bearer + refresh, bcrypt) + protección de rutas (`AuthGuard`).
2. **Billetera real:** ledger contable, depósitos/retiros con **aprobación manual** en `/admin`,
   saldo/historial reales, cola de aprobaciones funcional.
3. **Tiempo real** (Socket.IO): auth, mesas, presencia, reconexión, escrow.
4. **Los 3 juegos server-driven:** **Bingo** (`/bingo`), **Dominó** (`/domino`), **Póker** (`/poker`).
5. **Admin real:** métricas, usuarios (suspender/reactivar), mesas en vivo.
6. **Hardening:** rate-limit, helmet, logging.
7. **110 pruebas e2e en verde** contra Neon.

**⏳ Pendiente:**
- ✅ **Deploy HECHO (13/06/2026):** backend en https://betmarplay-server.onrender.com (Render free) +
  `NEXT_PUBLIC_API_URL`/`_SOCKET_URL` en Vercel → https://plataforma-apuestas.vercel.app en vivo.
  Pendiente del usuario: rotar contraseña de Neon y token de GitHub; crear admin con `betmarplay@gmail.com`.
- ⏸️ **Login con Google:** código listo (`/auth/google` + `components/google-signin.tsx`); falta crear el
  OAuth Client ID (cuenta `betmarplay@gmail.com` en revisión por Google) y poner `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
  (Vercel) + `GOOGLE_CLIENT_ID` (Render).
- 🎨 **Rediseño visual:** **Dominó muy pulido** (15/06): jugadores alrededor de la mesa, **tablero en
  serpiente que dobla en L** (`computeSnake`, fichas de tamaño fijo que **coinciden número con número**),
  **fichas planas 2D** (el cliente descartó el 3D), inclinación de cámara, **modo inmersivo horizontal en
  celular** (giro CSS, funciona en iPhone), pantalla completa solo del juego (`components/stage-fullscreen.tsx`),
  chat que cierra al tocar fuera, iconos SVG (`components/icons.tsx`). Backend: **límite de 1 mesa activa
  por usuario**. **Falta** subir **Póker y Bingo** al nivel del Dominó. Ver [`BITACORA.md`](../BITACORA.md) §14.
- **Parley y Caballos:** Fase 2 (siguen como prototipo).

> Auth, billetera, lobby, perfil, admin y los 3 juegos ya usan datos reales. Solo parley/caballos
> siguen hardcodeados (Fase 2).

## 11. Otros archivos

- `public/logo.png` — logo (también base del favicon `app/icon.png`).
- `public/games/` — fondos de tarjetas + `README.txt` con instrucciones.
- `README.md` (en `vegasve/`) — descripción del proyecto y pasos en Windows.
- Raíz del repo: `README.md` (instrucciones del handoff original de Claude Design),
  `CLAUDE.md` (orientación para sesiones de Claude Code) y `chats/` (transcripción del diseño).

## 12. Registro de cambios recientes (changelog)

Orden cronológico inverso.

- **Póker estilo casino + pulido móvil + sonidos (18-19/06/2026)** — skin morado con **riel dorado**,
  **anillo de tiempo** que se llena en la foto del jugador (`TurnRing` + `@property --pkp`), **máx. 5
  jugadores**, **sonidos** de cartas/fichas (`lib/sfx.ts`: deal/chip/fold/check) y **animaciones**
  (cartas con giro, pop de fichas). Se quitó el **chat** de los 3 juegos, la "B" central y los textos
  "Esperando jugadores". Fixes móvil (giro 90°): ganador en una línea, asiento de abajo no pisa el All-in,
  **etiqueta de saldo que no corta números** (`width:max-content`), botón de Bingo "Cartón · Bs. X". Lobby
  sin "Bono activo" (`.bal-3`). Detalle en [`BITACORA.md`](../BITACORA.md) §17. **APIs (investigación):**
  Parley → admin-curado (gratis) o API-Football (free 100/día, comercial OK); Caballos → **no hay API gratis
  de Venezuela**, va virtual RNG o admin manual.
- **Rediseño PRO de los 5 juegos + móvil horizontal (18/06/2026)** — **Bingo:** hasta **6 cartones en filas
  de 3** (backend `MAX` 4→6). **Móvil horizontal forzado en Bingo/Dominó/Póker** (reglas `*-immersive`
  compartidas en `globals.css`). **Póker PRO:** mesa ovalada con **asientos alrededor de la elipse**
  (`seatStyle` en `app/poker/page.tsx`), dealer button, fichas, cartas del héroe grandes, slider de subida,
  inmersivo. **Caballos** (hípica estilo Cordialito: Carrera win/place/show + Polla) y **Parley** (deportes,
  acumulador): pasaron de prototipo a **UI PRO + `AuthGuard` + saldo real**; apostar de verdad = "en
  preparación" (necesita backend + decisión del cliente sobre fuente de datos). Detalle en
  [`BITACORA.md`](../BITACORA.md) §16 y [`ESTADO.md`](../ESTADO.md) (sección 18/06).
- **Bingo "Royale" (17-18/06/2026)** — un solo `.game-stage`, **bombo 3D** (canvas, `BingoMachine`), cartones
  5×5 con sello animado, aviso "¡Te falta 1!/¡LÍNEA!"; se quitó la tabla 1-75. **Fix deploy:** `buildFilter`
  en `render.yaml` (los push de frontend ya NO reinician el backend). Detalle en BITÁCORA §15.
- **Pulido del Dominó (15/06/2026)** — jugadores alrededor de la mesa; **tablero en serpiente que dobla
  en L** (`computeSnake`, fichas fijas que coinciden número con número); **fichas planas 2D** más grandes;
  inclinación de cámara; **modo inmersivo horizontal en celular** (giro CSS, sirve en iPhone); pantalla
  completa solo del juego (`components/stage-fullscreen.tsx`, iPhone simulada); chat cierra al tocar fuera;
  emojis→SVG (`components/icons.tsx`); backend **1 mesa por usuario**; fix perfil `.pcard`→`.pkcard`;
  overlay de servidor con pre-encendido. Detalle en [`BITACORA.md`](../BITACORA.md) §14.
- **backend M8 (hardening+deploy)** — rate-limit (`server/src/middleware/rateLimit.ts`), helmet, morgan,
  `trust proxy`, límite de body. `render.yaml`/`Dockerfile` listos (Render free). Guía `server/DESPLIEGUE.md`.
- **backend M7 (admin)** — `/admin/metrics|users|tables`, suspender/reactivar; `components/admin-metrics|users|tables.tsx`.
- **backend M6 (póker)** — Texas Hold'em (`server/src/games/poker/`, usa `pokersolver`), side pots, showdown; página `/poker`.
- **backend M5 (dominó)** — block dominoes 2-4 (`server/src/games/domino/`), tranque; página `/domino`.
- **backend M4 (bingo)** — 75 bolas server-driven (`server/src/games/bingo/`); página `/bingo`.
- **backend M3 (tiempo real)** — núcleo Socket.IO (`server/src/realtime/`): hub, presencia, reconexión, escrow.
- **backend M2 (billetera)** — ledger de doble entrada (`server/src/wallet/`), depósitos/retiros con
  aprobación manual en `/admin`, `wallet-dialog.tsx` real, historial del perfil real, `components/admin-queue.tsx`.
- **backend M1 (auth)** — JWT bearer + refresh, bcrypt (`server/src/auth/`), `lib/auth-context.tsx`,
  `components/auth-guard.tsx`, `auth-dialog.tsx` conectado, rutas protegidas.
- **backend M0 (infra)** — proyecto `server/` (Express + Socket.IO + Prisma + Neon vía driver
  serverless por 443), `lib/api.ts` y `lib/socket.ts` en el front, `Dockerfile` + `render.yaml`.
- **docs** — `CLAUDE.md`, `CONTINUIDAD.md`, `README.md` reescritos para retomar sin contexto;
  se eliminaron componentes huérfanos (`coming-soon.tsx`, `lobby-filters.tsx`).
- **footer + márgenes** — footer extraído a `components/site-footer.tsx` y añadido al **lobby**
  (móvil y PC); más margen superior/inferior en **perfil** (móvil).
- **tarjetas "Pronto"** — ahora con foto de fondo (ruleta/blackjack/dados/tragamonedas/**ludo**,
  Baccarat fue reemplazado por Ludo) + capa oscura/grayscale de "no disponible"; sección de
  features pasa a **3 recuadros en una línea** en móvil.
- **nav + pagos** — navbar logueada con un solo enlace **"Inicio"**; métodos de pago del footer
  en **marquee** de una línea en móvil; "NowPayments" renombrado a **"Criptomonedas"**; fix del
  **zoom de inputs en iOS** (font-size 16px en móvil).
- **simetría de juegos** — el **inicio** muestra los 5 juegos igual que el lobby; los 5 "Pronto"
  se integran en la misma rejilla (10 tarjetas, 2 columnas simétricas en PC).
- **producción** — imágenes optimizadas, **fix del scroll de modales** (patrón Radix), SEO
  (OG/robots/sitemap), 404 + error boundary, validación de formularios, favicon, logout en rojo,
  se quitó el login con Facebook y los filtros del lobby.

> Cuando hagas cambios relevantes, **añade una línea aquí** y actualiza la sección 10 si cambia
> el estado de "hecho/pendiente".

---

## 13. Backend (`../server/`) — nuevo

Carpeta hermana de `vegasve/`. Node 20 + TypeScript (ESM): **Express** (REST) + **Socket.IO**
(tiempo real) + **Prisma** + **Postgres (Neon)**. Documentación propia en `../server/README.md`.

### Conexión a la base — detalle CRÍTICO
El **puerto 5432 está bloqueado** en el entorno de desarrollo (solo sale HTTP/HTTPS 443). La DB se
usa con el **driver serverless de Neon** (`@neondatabase/serverless` + `@prisma/adapter-neon`) sobre
443 — funciona en dev y en producción. Por eso `prisma db push`/`migrate` no corren aquí: para
cambios de esquema se usa `npm run db:diff` (genera `prisma/init.sql`) + `npm run db:apply`.

### Dinero
Todo en **céntimos** (`BigInt`), nunca floats. Ledger de doble entrada; la primitiva atómica
`applyLedger` (`src/wallet/ledger.ts`) hace cada movimiento dentro de una transacción y evita
sobregiros con un `updateMany` condicional. Depósito = pendiente → admin aprueba → acredita.
Retiro = debita al solicitar (retención); rechazar reintegra.

### Estructura
```
server/src/
  index.ts     Arranque (Express + Socket.IO)
  env.ts db.ts json.ts http.ts errors.ts
  auth/        register/login/refresh/logout/me, JWT, middleware  (Módulo 1)
  wallet/      ledger + depósitos/retiros                          (Módulo 2)
  admin/       cola de aprobaciones                                (Módulo 2; se amplía en M7)
  realtime/ games/   (Módulos 3-6, en construcción)
server/prisma/schema.prisma   modelo de datos (User, Account, LedgerEntry, *Request, GameTable…)
server/scripts/   test-auth.ts (16), test-wallet.ts (20)  — correr con el server vivo
```

### Cómo conecta el frontend
`vegasve/lib/api.ts` (REST + token + auto-refresh) y `vegasve/lib/socket.ts` (Socket.IO).
Variables: `NEXT_PUBLIC_API_URL` / `NEXT_PUBLIC_SOCKET_URL` (en `vegasve/.env.local`, por defecto
`http://localhost:4000`). Contexto de sesión: `vegasve/lib/auth-context.tsx`.

### Despliegue
Backend a **Render** (free, sin tarjeta; `Dockerfile` + `render.yaml` listos). Frontend a Vercel. **Ojo:** no
empujar el frontend a `main`/producción hasta que el backend esté desplegado y `NEXT_PUBLIC_API_URL`
configurada en Vercel, o la producción quedará sin poder loguear.

