# Despliegue de BetmarPlay

Dos piezas: **backend** (`server/`) en **Render** (free, sin tarjeta) y **frontend**
(`vegasve/`) en **Vercel**. Hazlo en este orden: primero el backend, luego Vercel.

> **Por qué Render y no Fly.io:** en 2026 Fly.io eliminó el free tier (pide tarjeta y solo
> da un trial de horas). Render tiene plan **free sin tarjeta**, soporta **WebSockets** y, gracias
> a que los mensajes WS cuentan como tráfico, **no se duerme mientras haya gente jugando**. Solo
> hiberna tras 15 min de inactividad total y tarda ~1 min en despertar — sin riesgo para el dinero,
> que vive en el ledger de Neon.

---

## 1) Backend en Render

Ya hay un **`render.yaml`** (blueprint) en la raíz del repo que define el servicio. Así que casi
todo es automático.

### 1.1 Crea la cuenta (sin tarjeta)
1. Entra a **https://render.com** → **Get Started** → **Sign up with GitHub**.
2. Autoriza a Render a ver tu repo `aleanfx/plataforma_apuestas`.

### 1.2 Crea el servicio con el Blueprint
1. En el panel de Render: **New +** → **Blueprint**.
2. Elige el repo **`plataforma_apuestas`** y rama **`main`**.
3. Render detecta el `render.yaml` y muestra el servicio `betmarplay-server`. Dale **Apply**.

### 1.3 Carga los secretos (Environment)
Render te pedirá los valores marcados como `sync: false`. Pégalos (los mismos de tu `server/.env`):

| Clave | Valor |
| --- | --- |
| `DATABASE_URL` | el de tu `server/.env` (cadena de Neon) |
| `JWT_ACCESS_SECRET` | el de tu `server/.env` |
| `JWT_REFRESH_SECRET` | el de tu `server/.env` |
| `ADMIN_EMAIL` | `betmarplay@gmail.com` |
| `CORS_ORIGINS` | `https://plataforma-apuestas.vercel.app` |

> `NODE_ENV`, `BS_PER_USD` y `PORT` ya están resueltos (los dos primeros en el `render.yaml`;
> `PORT` lo inyecta Render solo). No necesitas `DIRECT_URL` en producción.

### 1.4 Despliega
Al dar **Apply**, Render construye con el `Dockerfile` y despliega. Tarda unos minutos la 1ª vez.
Cuando termine, tu backend estará en `https://betmarplay-server.onrender.com` (o el nombre que
muestre Render). Pruébalo:
```
https://<tu-servicio>.onrender.com/health   ->  {"ok":true,...}
```

> Si el nombre `betmarplay-server` está tomado, Render le añade un sufijo. **Anota la URL final**:
> la necesitas para Vercel (paso 2) y para `CORS_ORIGINS`.

---

## 2) Frontend en Vercel

> ⚠️ Haz esto **solo cuando el backend ya responda** en `/health`. Si rediriges el frontend antes,
> el login en producción queda roto.

1. En el proyecto de Vercel (el que ya despliega `vegasve/` desde `main`), ve a
   **Settings → Environment Variables** y añade (para *Production*):
   - `NEXT_PUBLIC_API_URL` = `https://<tu-servicio>.onrender.com`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://<tu-servicio>.onrender.com`
2. **Redeploy** (Deployments → ⋯ → Redeploy) para que tome las variables.
3. Listo: login, billetera y juegos en `https://plataforma-apuestas.vercel.app` ya hablan con el
   backend real.

> Si tu dominio de Vercel es otro, ponlo en `CORS_ORIGINS` (paso 1.3) — admite varios separados por
> coma: `CORS_ORIGINS="https://plataforma-apuestas.vercel.app,https://otro-dominio.com"`.

---

## 3) Después del primer deploy

- **Crea el admin:** entra a la web y regístrate con `betmarplay@gmail.com` → recibe rol admin
  automáticamente. Desde `/admin` apruebas depósitos/retiros.
- **Rota la contraseña de Neon** (se compartió en el chat): panel de Neon → *Reset password*, y
  actualiza `DATABASE_URL` en Render (Environment) y en tu `server/.env` local.
- **Logs en vivo:** pestaña **Logs** del servicio en Render.
- **Re-deploy:** cada `git push` a `main` redepliega solo (`autoDeploy: true`). También puedes
  forzarlo con **Manual Deploy** en el panel.

## Notas / límites del MVP
- **Plan free de Render:** una sola instancia (estado de juegos en memoria), 512 MB RAM, 750 h/mes.
  Duerme tras 15 min sin tráfico; despierta en ~1 min en la siguiente visita. Mientras alguien juega
  (mensajes WebSocket) se mantiene despierto. Un reinicio corta partidas en vivo, pero el **dinero
  está a salvo** (todo en el ledger de Neon).
- Escalar a varias instancias requeriría un adaptador de Socket.IO con Redis (Fase 2).
- Pendiente de producto regulado: licencia de juego, KYC/AML, juego responsable, RNG certificado.
