# ESTADO — BetmarPlay

> Estado de avance del proyecto. Última actualización: **24 de junio de 2026**.
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
| 9 | Caballos (hípica) — UI PRO + login + saldo real | 🟡 UI lista · backend de liquidación = decisión del cliente |
| 10 | Parley (deportes) — UI PRO + login + saldo real | 🟡 UI lista · backend de liquidación = decisión del cliente |
| 11 | Sistema Multi-moneda (USD/Bs/COP) + captura de comprobante | ✅ Completo |

> **MVP completo y EN VIVO.** Suite: **110 pruebas e2e en verde**. Los **3 juegos en vivo** (Bingo/Dominó/
> Póker) están reales y al **nivel visual PRO**. **Caballos y Parley** tienen la **UI lista** (login + saldo
> real) pero apostar de verdad espera **decisión del cliente** sobre la fuente de datos (ver sección 18/06).
> Desplegado el 13/06/2026 (backend en Render free, frontend en Vercel). Guía usada:
> [`server/DESPLIEGUE.md`](./server/DESPLIEGUE.md).
> **Multi-moneda y depósitos manuales:** Configuración y persistencia en DB Neon de mínimos de depósito y tasas (editables desde panel admin), selección obligatoria de moneda nativa al primer inicio/registro (bloqueo forzado en AuthGuard), cambio exclusivo en la página de perfil (con texto de advertencia optimizado), logos oficiales de marcas (Tether USDT, Binance, Pago Móvil, DaviPlata y Nequi), botón de copiado de datos de pago e indicación de correo de soporte si se deposita menos del mínimo.

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
- **🖥️ Pantalla completa** y práctica de **Dominó a 4** (parejas). (Ver actualización del 15/06 abajo.)

## Pulido del Dominó (15/06/2026)

Iteración visual completa del Dominó (afinada con capturas del cliente). Detalle técnico en
[`BITACORA.md`](./BITACORA.md) §14.

- **Jugadores alrededor de la mesa:** compañero arriba, rivales a los lados, tú abajo.
- **Tablero en serpiente que dobla en L** (`computeSnake` en `app/domino/page.tsx`): cadena continua que,
  al llegar al borde, gira con una **ficha vertical (esquina)** y sigue en sentido contrario. Fichas de
  **tamaño fijo** (no se aleja la vista) y **coinciden número con número** en cada junta (aprovecha el
  invariante `board[i].b===board[i+1].a` del motor).
- **Fichas planas 2D** (decisión final del cliente, tras probar 3D), más grandes, puntos sólidos.
- **Inclinación de cámara** (`perspective + rotateX`) del tablero.
- **Modo inmersivo horizontal en celular:** en una mesa, el juego ocupa la pantalla y, en vertical, se
  **gira 90° por CSS** (funciona en iPhone, donde no se puede forzar la orientación).
- **Pantalla completa SOLO del juego** (`components/stage-fullscreen.tsx`; en iPhone, simulada por CSS).
- **Chat flotante** que cierra al tocar fuera; **emojis → iconos SVG** (`components/icons.tsx`).
- **Límite de 1 mesa activa por usuario** (backend) para evitar choques entre dispositivos.
- **Fix:** perfil roto por colisión de clase `.pcard` (perfil vs carta de póker) → carta de póker = `.pkcard`.
- **Overlay "servidor despertando"** con pre-encendido + botones Reintentar/Recargar.

## Sesión: 5 juegos al nivel PRO + móvil horizontal + póker casino (18-19/06/2026)

Rediseño visual de toda la plataforma (detalle técnico en [`BITACORA.md`](./BITACORA.md) §16). **Todo
frontend salvo un cambio mínimo de backend** (límite de cartones de Bingo). Builds en verde, desplegado.

- **Bingo:** hasta **6 cartones** en **filas de 3** (backend `MAX_CARTONES_PER_PLAYER` 4→6). Cartones más
  compactos para que entren los 6 sin scroll.
- **Móvil horizontal forzado en TODOS los juegos de mesa** (Bingo, Dominó, Póker): al entrar a una mesa en
  celular, el juego ocupa la pantalla y se gira 90° por CSS (regla compartida `*-immersive`).
- **Póker PRO (estilo casino):** mesa **ovalada** con **riel dorado** sobre fondo morado de teatro;
  **asientos alrededor de la elipse** (yo abajo), avatares circulares con marco, **anillo de tiempo que se
  llena alrededor de la foto** del jugador en turno (sin número), cartas comunitarias + pozo al centro,
  **dealer button**, fichas "C" de apuesta, slider de subida. **Máximo 5 jugadores** (público y práctica).
  **Sonidos** (reparto, clink de fichas, tirar/pasar, ganar) y **animaciones** (cartas con giro, pop de
  fichas/ganador). Se quitó el chat de los 3 juegos. Backend Texas Hold'em intacto.
- **Caballos (hípica estilo Cordialito):** pestañas **Carrera** (Ganador/Place/Show) y **Polla Hípica**
  (puntos), caballos con jinete y cuotas, slip con ganancia potencial. **AuthGuard + saldo real.**
- **Parley (deportes):** partidos con cuotas 1/X/2, **acumulador** con cuota total y ganancia potencial.
  **AuthGuard + saldo real.**

> ⚠️ **Caballos y Parley:** la UI está lista y conectada a login + saldo real, pero **apostar de verdad
> está "en preparación"** porque la liquidación necesita backend nuevo + una **decisión del cliente sobre la
> fuente de datos** (ver "Decisiones pendientes" abajo). No se desplegó código de dinero sin probar (riesgo
> para el ledger).

### Decisiones pendientes del cliente (Caballos / Parley) — con investigación de APIs (19/06/2026)

**Parley (deportes) — sí hay APIs gratis, pero con límites:**
- **API-Football** (api-football.com): free ~**100 requests/día**, y **permite uso comercial** en todos los
  planes. Es la mejor opción gratis para fixtures + cuotas pre-partido. 100/día obliga a **cachear**.
- **The Odds API**: 500 req/mes gratis PERO **prohíbe uso comercial en el free** (solo de pago). Descartada.
- **TheSportsDB**: gratis para datos, pero **exige Patreon $9/mes para uso comercial**.
- **football-data.org**: free (fixtures, ~10 req/min) pero **sin cuotas**.
- ✅ **Recomendado:** **modelo admin-curado** (el admin crea partidos+cuotas y liquida en `/admin`) = gratis,
  sin límites, control total. Se puede **sembrar** con API-Football si se quiere automatizar después.

**Caballos (hípica) — NO hay API gratis útil:**
- Todas las APIs de hípica (The Racing API, Goalserve, Podium, BetsAPI, OddsMatrix) son **de pago** (solo
  prueba gratis de 2 semanas) y **NO cubren Venezuela** (La Rinconada/Valencia) — solo UK/USA/Francia/etc.
- El INH de Venezuela **no tiene API pública gratis**.
- ✅ **Recomendado:** **carreras virtuales (RNG)** decididas por el servidor (estilo "virtual sports") =
  gratis, siempre disponibles, sin depender de nadie. Alternativa: el admin sube el programa/resultados de
  La Rinconada **a mano**.

> En cualquiera de los dos, al elegir el modelo se construye el backend (tablas de eventos/apuestas +
> liquidación por el ledger ya probado) y se valida con un smoke test **antes** de activar dinero real.

### Pendientes abiertos (al 19/06/2026)
- **Dominó "todos contra todos":** el cliente quiere el dominó **individual (sin parejas)**, cada quien para
  sí. Mencionó además un **sistema de puntos casero** poco claro ("cada pase suma un punto al rival de la
  derecha"); quedó en **grabar una partida**. Falta su video/aclaración para programar el conteo; la parte de
  quitar parejas sí es clara. (Motor actual: `server/src/games/domino/`, 2-4 jugadores con parejas a 4.)
- **Caballos/Parley:** el cliente **aún no decide** la fuente de datos (ver arriba).
- **Multi-moneda:** Caballos y Parley ya usan `useCurrency`/`fmt` (cableado en el IDE Antigravity; build verde).

## Bingo "Royale" + fix de deploy (17-18/06/2026)

Detalle técnico en [`BITACORA.md`](./BITACORA.md) §15.

- **Bingo al nivel del Dominó** (solo frontend; backend y economía intactos, sigue 18/18): un solo recuadro
  `.game-stage`, **bombo 3D** con bolas flotando (canvas, `BingoMachine`), **cartones 5×5** con sello animado,
  espacio libre ★, línea ganadora resaltada y aviso "¡Te falta 1!/¡LÍNEA!" (calculado en cliente). Se quitó
  la tabla 1-75 y el historial. **Modo inmersivo** + pantalla completa + chat, como el Dominó.
- **⚠️ Causa de los cortes de servicio durante la sesión:** `render.yaml` redeployaba el backend en **cada**
  push a `main` (aunque fuera solo frontend). Se añadió **`buildFilter`** (ya **activo y verificado**: un push
  de solo-frontend ya NO reinicia el backend) para que solo redeploye con cambios en `server/`.
- **"Load failed" al loguear en iPhone (CAUSA CONFIRMADA):** NO era caché ni el iPhone. Era el **backend
  caído/frío** justo durante los intentos (redeploy en curso por el `autoDeploy` + cold start de Render free).
  Una vez caliente, entra igual en normal e incógnito. La cura es el `buildFilter` de arriba. Playbook de
  diagnóstico (CORS, headers, bundle, test de incógnito) en BITÁCORA §15.

## 🌙 Para revisar al despertar (sesión nocturna 18/06)

1. **Probar los 5 juegos en PC y celular** (capturas) y decirme ajustes finos:
   - **Bingo:** 6 cartones en filas de 3; en celular el juego se gira a horizontal.
   - **Póker:** mesa ovalada con asientos alrededor; revisar que los asientos no se solapen con muchos
     jugadores (no pude verlo en vivo) — si hay choques, lo afino con tu captura.
   - **Caballos / Parley:** UI nueva; el botón de apostar dice "en preparación" a propósito.
2. **Decidir el modelo de Caballos y Parley** (ver "Decisiones pendientes" arriba). En cuanto elijas, construyo
   el backend de liquidación (gratis con el modelo admin-curado / virtual RNG) y lo activo con dinero real.
3. Sigue pendiente (de antes): **Google login** (crear OAuth Client ID) y **rotar** secretos (Neon/GitHub).

## Lo que falta (acción tuya)

- ✅ ~~**Desplegar:** backend a Render + variables en Vercel.~~ **HECHO** (13/06/2026). En vivo.
- ⏸️ **Activar Google login:** crear OAuth Client ID cuando Google reactive la cuenta + poner las 2
  variables de entorno (ver arriba).
- 🔒 **Rotar** la contraseña de Neon y el token de GitHub (se compartieron en el chat). Tras rotar
  Neon: actualizar `DATABASE_URL` en Render (Environment) y en `server/.env`.
- **Crear admin:** registrarse en la web con `betmarplay@gmail.com` → rol admin automático.
- **Caballos y Parley:** UI PRO lista (login + saldo real); falta backend de liquidación tras tu decisión
  de fuente de datos (ver sección 18/06).
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
