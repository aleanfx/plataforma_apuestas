# VegasVE — Casino & Apuestas

Implementación en **Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui** del
prototipo de Claude Design para VegasVE: un casino premium oscuro (negro profundo, dorado
contenido, acentos verdes) con tipografía Cormorant Garamond + Jost.

## Páginas

| Ruta        | Descripción                                                                 |
| ----------- | --------------------------------------------------------------------------- |
| `/`         | Landing: hero con cartas/dominó flotando en 3D, juegos, "Próximamente", features, footer. |
| `/lobby`    | Lobby (sesión iniciada): saldo Bs.+USD, bono, filtros y tarjetas de juego.  |
| `/profile`  | Perfil: identidad, estadísticas, saldo destacado e historial de movimientos. |
| `/admin`    | Panel de operaciones: métricas, usuarios, cola de aprobaciones y juegos.    |

**Login / Registro** son modales (`AuthDialog`), igual que en el diseño original — se abren
desde la landing. **Depositar / Retirar** son modales (`WalletDialog`) con selector de método
(Binance, USDT, Pago Móvil, Zelle), montos rápidos y cálculo de equivalente USD.

> Prototipo **estático/visual**: los datos (saldos, historial, usuarios) son de muestra y no
> hay backend. La navegación, los modales y los avisos (toasts) sí funcionan.

## Estructura

```
app/
  layout.tsx        Fuentes (next/font), Toaster global
  globals.css       Tokens del tema + componentes (port del prototipo)
  page.tsx          Landing
  lobby/page.tsx
  profile/page.tsx
  admin/page.tsx
components/
  site-nav.tsx      Nav (variantes sesión cerrada / abierta)
  hero-art.tsx      Cartas + dominó con animación 3D
  game-cards.tsx    Tarjetas de juego (landing y lobby)
  coming-soon.tsx   Fila "Próximamente"
  lobby-filters.tsx Chips de filtro
  auth-dialog.tsx   Modal login/registro (shadcn Dialog + Tabs)
  wallet-dialog.tsx Modal depósito/retiro
  admin-actions.tsx Acciones de aprobar/rechazar/suspender
  icons.tsx         Iconos SVG lineales
  ui/               Primitivas shadcn/ui (dialog, tabs, sonner)
lib/utils.ts        helper cn()
```

## Desarrollo

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # build de producción
npm run start    # servir build
```
