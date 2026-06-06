# BetmarPlay — Casino & Apuestas

Plataforma de casino y apuestas en **Next.js 14 (App Router) + TypeScript + Tailwind CSS +
shadcn/ui**. Tema **galaxia / neón** sobre fondo morado-oscuro (`#0d0b1e`) con acentos en
morado, cyan, rosa, naranja y dorado, fondo de nebulosa + estrellas en CSS puro y tipografía
Outfit + Jost + Dancing Script.

> **¿Retomas el proyecto sin contexto?** Lee primero **[`CONTINUIDAD.md`](./CONTINUIDAD.md)**:
> tiene el estado completo, la arquitectura, lo ya resuelto, el flujo de despliegue y lo pendiente.

> ⚠️ El proyecto Next.js vive en esta carpeta **`vegasve/`** (no en la raíz del repo).
> Todos los comandos `npm` se corren aquí.

## Páginas

| Ruta         | Descripción                                                                          |
| ------------ | ------------------------------------------------------------------------------------ |
| `/`          | Landing (sesión cerrada): hero 3D, **5 juegos + 5 "Pronto"**, features, footer. Las tarjetas invitan a registrarse. |
| `/lobby`     | Lobby (sesión iniciada): saludo, banner de saldo, **los mismos 10 juegos**, footer. |
| `/bingo`     | **Bingo**: cartón 5×5, generar/comprar cartón, números cantados animados, saldo.     |
| `/parley`    | **Parley**: 5 partidos con cuotas (Local/Empate/Visitante), acumulador y ganancia potencial. |
| `/caballos`  | **Caballos / Pollas Hípicas**: carreras del día, selección por puesto (1ro/2do/3ro), puntos, sellar polla. |
| `/profile`   | Perfil: identidad, estadísticas, saldo destacado e historial de movimientos.         |
| `/admin`     | Panel de operaciones: métricas, usuarios, cola de aprobaciones y juegos.             |

Extras de `app/`: `icon.png` (favicon), `not-found.tsx` (404), `error.tsx` (error boundary),
`robots.ts` y `sitemap.ts` (SEO).

**Login / Registro** son modales (`AuthDialog`, solo social con Google). **Depositar / Retirar**
son modales (`WalletDialog`) con métodos: **Criptomonedas, Binance, Pago Móvil, Daviplata y
Nequi**, con montos rápidos y equivalente en USD.

> Prototipo **estático/visual** (frontend): los datos (saldos, partidos, carreras, usuarios)
> son de muestra y **no hay backend**. La navegación, los modales, los juegos y los avisos
> (toasts) sí funcionan en el cliente.

## Juegos

Definidos en **`components/game-cards.tsx`** (arrays `GAMES` y `SOON`):

- **Disponibles (5):** Dominó, Póker, Bingo, Parley, Caballos.
- **Próximamente (5):** Ruleta, Blackjack, Dados, Tragamonedas, Ludo — se ven como tarjetas de
  juego con sello "Pronto" + capa oscura (no disponibles aún).
- Las 10 tarjetas se muestran **igual en landing y lobby**: rejilla de 2 columnas en PC,
  carrusel deslizable en móvil. Cada una con foto de fondo desde `public/games/<slug>.jpg`.

Lógica interactiva (sin backend): **Bingo** genera cartón 5×5 y "canta" números; **Parley**
multiplica cuotas y calcula ganancia; **Caballos** suma puntos por puesto (5/3/1).

## Estructura

```
app/
  layout.tsx        Fuentes (next/font), metadata/SEO, Toaster global
  icon.png          Favicon (generado desde el logo)
  globals.css       Tokens del tema galaxia/neón + componentes + responsive
  page.tsx          Landing
  lobby/page.tsx
  bingo/ parley/ caballos/   Juegos
  profile/ admin/            Perfil y panel
  not-found.tsx error.tsx robots.ts sitemap.ts
components/
  site-nav.tsx      Navbar (variantes out / in con enlace "Inicio")
  site-footer.tsx   Footer reutilizable (logo + legal + marquee de pagos)
  game-cards.tsx    Tarjetas de juego (GAMES + SOON) para landing y lobby
  hero-art.tsx      Cartas + dominó 3D del hero
  auth-dialog.tsx   Modal login/registro (Google)
  wallet-dialog.tsx Modal depósito/retiro (5 métodos)
  admin-actions.tsx Acciones del panel admin
  ticker.tsx        Cinta de ganancias en vivo (demo)
  icons.tsx         Iconos SVG
  ui/               Primitivas shadcn/ui (dialog, tabs, sonner)
lib/utils.ts        helper cn()
public/
  logo.png          Logo (también base del favicon)
  games/            Fondos de tarjetas (.jpg) + README.txt
```

## Recursos / imágenes

- **Logo:** `public/logo.png` (transparente). La navbar lo usa; si falta, muestra el logo de
  texto. El favicon se genera del logo en `app/icon.png`.
- **Fondos de tarjetas:** `public/games/<slug>.jpg` — uno por tarjeta: `domino, poker, bingo,
  parley, caballos, ruleta, blackjack, dados, tragamonedas, ludo`. Si falta una, la tarjeta usa
  un degradado de respaldo. Ver `public/games/README.txt`.

## Responsive (puntos ya resueltos)

- Sin scroll horizontal en móvil (`overflow-x: clip`).
- Tarjetas de juego en carrusel; features en 3 columnas (1 línea) en móvil.
- Inputs a 16px en móvil (evita el zoom de iOS al enfocar).
- Modales con scroll interno (`max-h-[88dvh]` + capa `overflow-y-auto`, requisito de Radix).
- Breakpoints: `980px` (admin/tablet), `768px`, `560px`, `430px` (iPhone).

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run start    # servir build
```

### Correr en Windows (paso a paso)

1. Instala **Node.js LTS** desde https://nodejs.org (incluye `npm`).
2. Abre **PowerShell** y clona el repo:
   ```powershell
   git clone https://github.com/aleanfx/plataforma_apuestas.git
   cd plataforma_apuestas/vegasve
   ```
3. Instala dependencias: `npm install`
4. Arranca: `npm run dev`
5. Abre `http://localhost:3000`.

## Despliegue

Producción en **Vercel** (https://plataforma-apuestas.vercel.app), **desde la rama `main`**.
Empujar a `main` dispara el deploy. Detalles de git/token en `CONTINUIDAD.md`.
