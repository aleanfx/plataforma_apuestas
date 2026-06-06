# CODING AGENTS: READ THIS FIRST

> ## ✅ ESTADO ACTUAL — el diseño YA está implementado
>
> Este bundle de diseño ya fue convertido en una app real: **BetmarPlay**, un frontend
> **Next.js 14** que vive en la carpeta [`vegasve/`](./vegasve/) y se despliega en Vercel desde
> la rama `main` (https://plataforma-apuestas.vercel.app).
>
> **Para retomar/continuar el proyecto, lee en este orden:**
> 1. [`CLAUDE.md`](./CLAUDE.md) — orientación rápida (comandos, git, dónde editar).
> 2. [`vegasve/CONTINUIDAD.md`](./vegasve/CONTINUIDAD.md) — **documento maestro de contexto**
>    (arquitectura, decisiones ya resueltas, despliegue, pendientes).
> 3. [`vegasve/README.md`](./vegasve/README.md) — estructura del proyecto y cómo correrlo.
>
> Lo que sigue abajo es la guía del **handoff original** del diseño (contexto histórico).

---

This is a **handoff bundle** from Claude Design (claude.ai/design).

A user mocked up designs in HTML/CSS/JS using an AI design tool, then exported this bundle so a coding agent can implement the designs for real.

## What you should do — IMPORTANT

**Read the chat transcripts first.** There are 1 chat transcript(s) in `chats/`. The transcripts show the full back-and-forth between the user and the design assistant — they tell you **what the user actually wants** and **where they landed** after iterating. Don't skip them. The final HTML files are the output, but the chat is where the intent lives.

**Read `project/index.html` in full.** The user had this file open when they triggered the handoff, so it's almost certainly the primary design they want built. Read it top to bottom — don't skim. Then **follow its imports**: open every file it pulls in (shared components, CSS, scripts) so you understand how the pieces fit together before you start implementing.

**If anything is ambiguous, ask the user to confirm before you start implementing.** It's much cheaper to clarify scope up front than to build the wrong thing.

## About the design files

The design medium is **HTML/CSS/JS** — these are prototypes, not production code. Your job is to **recreate them pixel-perfectly** in whatever technology makes sense for the target codebase (React, Vue, native, whatever fits). Match the visual output; don't copy the prototype's internal structure unless it happens to fit.

**Don't render these files in a browser or take screenshots unless the user asks you to.** Everything you need — dimensions, colors, layout rules — is spelled out in the source. Read the HTML and CSS directly; a screenshot won't tell you anything they don't.

## Bundle contents

- `README.md` — this file
- `chats/` — conversation transcripts (read these!)
- `project/` — the `VegasVE` project files (HTML prototypes, assets, components)
