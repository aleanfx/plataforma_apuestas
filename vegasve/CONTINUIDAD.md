# BetmarPlay — Guía de Continuidad / Contexto del Proyecto

> **Léeme primero.** Este documento es el "estado de la verdad" para retomar el proyecto en
> una sesión nueva sin contexto previo. Resume QUÉ es, CÓMO está construido, DÓNDE está cada
> cosa, CÓMO se despliega y QUÉ falta. Última actualización: **6 de junio de 2026**.

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

**⏳ Pendiente — requiere BACKEND (no es posible solo con frontend):**
1. **Autenticación real** + sesiones (hoy el login entra a `/lobby` sin validar).
2. **Protección de rutas** (`/admin`, `/lobby`, `/profile` son accesibles por URL; falta middleware).
3. **Base de datos / datos reales** (saldos, "Rafael", usuarios, partidos y carreras están hardcodeados).
4. **Lógica de juego y dinero real** (Bingo/Parley/Caballos solo validan y muestran toasts).
5. **Pagos reales** (los métodos muestran datos fijos).
6. **Mesas reales de Dominó y Póker** (hoy solo un toast "Abriendo mesas…").

## 11. Otros archivos

- `public/logo.png` — logo (también base del favicon `app/icon.png`).
- `public/games/` — fondos de tarjetas + `README.txt` con instrucciones.
- `README.md` (en `vegasve/`) — descripción del proyecto y pasos en Windows.
- Raíz del repo: `README.md` (instrucciones del handoff original de Claude Design),
  `CLAUDE.md` (orientación para sesiones de Claude Code) y `chats/` (transcripción del diseño).

## 12. Registro de cambios recientes (changelog)

Orden cronológico inverso. La punta de `main` en la última sesión documentada fue **`4020a48`**.

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

