# BetmarPlay — Guía de Continuidad / Handoff

Estado del proyecto al **5 de junio de 2026**. Este documento resume qué está hecho, qué
falta y cómo continuar. Léelo junto con `README.md`.

## ✅ Hecho

### Marca y visual
- Rebranding completo **VegasVE → BetmarPlay** con tema **galaxia / neón** (`#0d0b1e`,
  morado, cyan, rosa, naranja, dorado), nebulosa + estrellas en CSS, tipografías Outfit /
  Jost / Dancing Script.
- **Logo** más grande en la navbar (52px desktop, 46px ≤768px, 40px ≤430px).
- **Favicon** generado desde el logo (`app/icon.png`).
- **Tarjetas de juego** con imagen de fondo por foto + velo oscuro para legibilidad. Las
  fotos van en `public/games/` (ver `public/games/README.txt`).

### Juegos nuevos (frontend interactivo)
- `/bingo` — cartón 5×5, generar/comprar, números cantados con animación de pulso, saldo.
- `/parley` — 5 partidos, Local/Empate/Visitante con cuotas, acumulador y ganancia potencial.
- `/caballos` — 3 carreras × 6 caballos, puesto 1ro/2do/3ro, puntos (5/3/1), sellar polla.
- Las 3 tarjetas nuevas aparecen en el **lobby** junto a Dominó y Póker (5 en total).

### UX / responsive
- Sin scroll horizontal en móvil (`overflow-x: clip`).
- Layout de juego de 2 columnas → 1 columna en `≤900px`; clases reutilizables
  (`.game-layout`, `.game-panel`, `.game-grid-5`, `.game-grid-3`, `.game-opt`, `.game-side`).
- Modales con animación fluida (entrada `easeOutExpo`, scale + translate, sin saltos) y
  scroll vertical interno cuando el contenido es alto.
- Métodos de pago en wallet: Criptomonedas, Binance, Pago Móvil, Daviplata, Nequi.

## ⏳ Pendiente / siguientes pasos

1. **Subir las 5 fotos** de fondo de tarjetas a `public/games/` con los nombres exactos
   (`domino.jpg`, `poker.jpg`, `bingo.jpg`, `parley.jpg`, `caballos.jpg`).
2. **Backend / persistencia**: hoy todo es de muestra (saldos, partidos, carreras, usuarios).
   Falta API, base de datos, autenticación real y procesamiento de pagos.
3. **Lógica real de juego**: el Bingo/Parley/Caballos validan y muestran toasts, pero no
   liquidan apuestas ni descuentan saldo real.
4. **Páginas de Dominó y Póker**: hoy solo muestran un toast "Abriendo mesas…". Falta la mesa.
5. **QA en dispositivos reales** (iPhone/Android) y revisión de accesibilidad (focus, teclado).

## Cómo continuar

```bash
cd vegasve
npm install
npm run dev          # http://localhost:3000
npm run build        # validar que todo compila antes de subir
```

- Para añadir un juego al lobby: edita el array `LOBBY` en `components/game-cards.tsx`.
- Para un juego nuevo con layout de 2 columnas, reutiliza las clases `.game-layout` /
  `.game-panel` / `.game-side` (ya responsivas) en lugar de estilos inline.
- Mantén `npm run build` en verde: el proyecto compila como sitio estático (SSG).

## Archivos clave

| Archivo                          | Qué contiene                                            |
| -------------------------------- | ------------------------------------------------------- |
| `app/globals.css`                | Tema, componentes y todos los breakpoints responsive.   |
| `components/game-cards.tsx`      | Tarjetas de juego (data-driven) de landing y lobby.     |
| `app/{bingo,parley,caballos}/`   | Los 3 juegos nuevos.                                     |
| `components/wallet-dialog.tsx`   | Modal de depósito/retiro con métodos de pago.           |
| `public/games/README.txt`        | Instrucciones de nombres de las fotos de tarjetas.      |
