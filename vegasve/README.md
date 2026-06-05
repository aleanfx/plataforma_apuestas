# BetmarPlay — Casino & Apuestas

Plataforma de casino y apuestas en **Next.js 14 (App Router) + TypeScript + Tailwind CSS +
shadcn/ui**. Tema **galaxia / neón** sobre fondo morado-oscuro (`#0d0b1e`) con acentos en
morado, cyan, rosa, naranja y dorado, fondo de nebulosa + estrellas en CSS puro y tipografía
Outfit + Jost + Dancing Script.

## Páginas

| Ruta         | Descripción                                                                          |
| ------------ | ------------------------------------------------------------------------------------ |
| `/`          | Landing: hero 3D (cartas + dominó neón), tarjetas de juego, "Próximamente", features. |
| `/lobby`     | Lobby (sesión iniciada): saldo Bs.+USD, bono, filtros y tarjetas de los 5 juegos.    |
| `/bingo`     | **Bingo**: cartón 5×5, generar/comprar cartón, números cantados animados, saldo.      |
| `/parley`    | **Parley**: lista de partidos (fútbol/béisbol/básquet), 3 opciones por partido, acumulador y ganancia potencial. |
| `/caballos`  | **Caballos / Pollas Hípicas**: carreras del día, selección por puesto (1ro/2do/3ro), sistema de puntos, sellar polla. |
| `/profile`   | Perfil: identidad, estadísticas, saldo destacado e historial de movimientos.         |
| `/admin`     | Panel de operaciones: métricas, usuarios, cola de aprobaciones y juegos.             |

**Login / Registro** son modales (`AuthDialog`). **Depositar / Retirar** son modales
(`WalletDialog`) con selector de método: **Criptomonedas, Binance, Pago Móvil, Daviplata y
Nequi**, con montos rápidos y cálculo de equivalente USD.

> Prototipo **estático/visual** (frontend): los datos (saldos, partidos, carreras, usuarios)
> son de muestra y no hay backend. La navegación, los modales, los juegos nuevos y los avisos
> (toasts) sí funcionan en el cliente.

## Juegos nuevos (frontend interactivo)

- **Bingo** (`/bingo`): genera un cartón 5×5 con números aleatorios (1–75), "canta" números
  con animación de pulso, marca aciertos y muestra el potencial según el monto apostado.
- **Parley** (`/parley`): 5 partidos ficticios con cuotas; eliges Local / Empate / Visitante.
  El acumulador multiplica las cuotas y calcula la ganancia potencial en vivo.
- **Caballos** (`/caballos`): 3 carreras del día con 6 caballos cada una; eliges caballo por
  puesto (1ro = 5 pts, 2do = 3 pts, 3ro = 1 pt). Suma puntos y "sella la polla".

## Estructura

```
app/
  layout.tsx        Fuentes (next/font), metadata, Toaster global
  icon.png          Favicon (generado desde el logo)
  globals.css       Tokens del tema galaxia/neón + componentes
  page.tsx          Landing
  lobby/page.tsx
  bingo/page.tsx        ← juego nuevo
  parley/page.tsx       ← juego nuevo
  caballos/page.tsx     ← juego nuevo
  profile/page.tsx
  admin/page.tsx
components/
  site-nav.tsx      Nav (variantes sesión cerrada / abierta) con logo
  hero-art.tsx      Cartas + dominó con animación 3D neón
  game-cards.tsx    Tarjetas de juego (landing y lobby), data-driven con fondo por foto
  coming-soon.tsx   Fila "Próximamente"
  lobby-filters.tsx Chips de filtro
  auth-dialog.tsx   Modal login/registro (shadcn Dialog + Tabs)
  wallet-dialog.tsx Modal depósito/retiro (5 métodos de pago)
  admin-actions.tsx Acciones de aprobar/rechazar/suspender
  icons.tsx         Iconos SVG lineales
  ui/               Primitivas shadcn/ui (dialog, tabs, sonner)
lib/utils.ts        helper cn()
public/
  logo.png          Logo de la marca (también usado como favicon)
  games/            Fondos de las tarjetas (domino/poker/bingo/parley/caballos .jpg)
```

## Recursos / imágenes

- **Logo**: `public/logo.png` (transparente). La navbar lo usa automáticamente; si falta, se
  muestra el logo de texto. El favicon se genera desde el logo en `app/icon.png`.
- **Fondos de tarjetas**: coloca las fotos en `public/games/` con nombres exactos
  `domino.jpg`, `poker.jpg`, `bingo.jpg`, `parley.jpg`, `caballos.jpg`. Si una falta, la
  tarjeta usa un degradado oscuro de respaldo. Un velo oscuro asegura legibilidad del texto.
  Ver `public/games/README.txt`.

## Responsive

- Sin scroll horizontal en móvil (`overflow-x: clip` en `html, body`).
- Carruseles deslizables (tarjetas y features) en `≤768px`.
- Las páginas de juego usan layout de 2 columnas que colapsa a 1 columna en `≤900px`.
- Breakpoints: `980px` (tablet/admin), `768px`, `560px`, `430px` (iPhone).

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
   git clone <URL-del-repo>
   cd <carpeta>/vegasve
   ```
3. Instala dependencias: `npm install`
4. Arranca en desarrollo: `npm run dev`
5. Abre el navegador en `http://localhost:3000`.
