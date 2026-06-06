# CLAUDE.md — Orientación para sesiones de Claude Code

Este repo contiene **BetmarPlay**, un **frontend** (Next.js 14) de una plataforma de casino y
apuestas para Venezuela. Es un prototipo visual/interactivo **sin backend** (datos hardcodeados).

## Lo primero que debes saber

- **El proyecto Next.js está en la subcarpeta [`vegasve/`](./vegasve/)**, no en la raíz.
  Corre todos los comandos `npm` dentro de `vegasve/`.
- **Lee [`vegasve/CONTINUIDAD.md`](./vegasve/CONTINUIDAD.md)** — es el documento maestro con el
  estado completo: arquitectura, dónde está cada cosa, decisiones de UX ya resueltas (para no
  re-romperlas), flujo de despliegue y lo que falta (todo lo pendiente requiere backend).
- También está [`vegasve/README.md`](./vegasve/README.md) con la estructura y los pasos.

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
- Producción (Vercel: https://plataforma-apuestas.vercel.app) **despliega desde `main`**.
  Empujar a `main` un commit fast-forward dispara el deploy automático.
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
