# Despliegue de BetmarPlay

Dos piezas: **backend** (`server/`) en **Fly.io** y **frontend** (`vegasve/`) en **Vercel**.
Hazlo en este orden: primero el backend, luego configura Vercel.

---

## 1) Backend en Fly.io (desde Windows / PowerShell)

### 1.1 Instala flyctl
```powershell
iwr https://fly.io/install.ps1 -useb | iex
# Cierra y reabre PowerShell. Verifica:
flyctl version
```

### 1.2 Crea la cuenta / inicia sesión
```powershell
flyctl auth signup   # o: flyctl auth login
```

### 1.3 Crea la app
Desde la carpeta `server/` (donde están `fly.toml` y `Dockerfile`):
```powershell
cd C:\Users\Ale\Desktop\plataforma_apuestas-main\server
flyctl apps create betmarplay-server
```
Si el nombre está tomado, elige otro (p. ej. `betmarplay-ale`) y **cámbialo en `fly.toml`** (línea `app = "..."`).

### 1.4 Carga los secretos
Usa los **mismos valores de tu `server/.env`** (DATABASE_URL, JWT_*). `CORS_ORIGINS` debe ser la URL del frontend en Vercel.
```powershell
flyctl secrets set `
  DATABASE_URL="postgresql://neondb_owner:...-pooler...neon.tech/neondb?sslmode=require&pgbouncer=true" `
  JWT_ACCESS_SECRET="<el de tu .env>" `
  JWT_REFRESH_SECRET="<el de tu .env>" `
  ADMIN_EMAIL="betmarplay@gmail.com" `
  CORS_ORIGINS="https://plataforma-apuestas.vercel.app" `
  BS_PER_USD="40"
```
> `PORT` y `NODE_ENV` ya van en `fly.toml`; no hace falta ponerlos como secretos.
> No necesitas `DIRECT_URL` en producción (solo se usa para migraciones locales).

### 1.5 Despliega
```powershell
flyctl deploy
```
Al terminar, tu backend estará en `https://<nombre-app>.fly.dev`. Pruébalo:
```powershell
curl https://<nombre-app>.fly.dev/health
# -> {"ok":true,...}
```

### 1.6 Asegura UNA sola máquina
El estado de las partidas vive **en memoria**; mantén una instancia:
```powershell
flyctl scale count 1
```

---

## 2) Frontend en Vercel

1. En el proyecto de Vercel (el que ya despliega `vegasve/` desde `main`), ve a
   **Settings → Environment Variables** y añade (para *Production*):
   - `NEXT_PUBLIC_API_URL` = `https://<nombre-app>.fly.dev`
   - `NEXT_PUBLIC_SOCKET_URL` = `https://<nombre-app>.fly.dev`
2. **Redeploy** (Deployments → ⋯ → Redeploy) para que tome las variables.
3. Listo: el login, la billetera y los juegos en `https://plataforma-apuestas.vercel.app`
   ya hablarán con el backend real.

> Si tu dominio de Vercel es otro, ponlo en `CORS_ORIGINS` (paso 1.4) — admite varios separados por coma:
> `CORS_ORIGINS="https://plataforma-apuestas.vercel.app,https://otro-dominio.com"`.

---

## 3) Después del primer deploy

- **Crea el admin:** entra a la web y regístrate con `betmarplay@gmail.com` → recibe rol admin
  automáticamente. Desde `/admin` apruebas depósitos/retiros.
- **Rota la contraseña de Neon** (se compartió en el chat): en el panel de Neon → *Reset password*,
  y actualiza el secreto en Fly (`flyctl secrets set DATABASE_URL="..."`) y tu `server/.env` local.
- **Logs en vivo:** `flyctl logs`.
- **Re-deploy del backend:** `flyctl deploy` tras cada cambio en `server/`.

## Notas / límites del MVP
- Una sola instancia (estado de juegos en memoria). Un reinicio corta las partidas en vivo;
  el **dinero está a salvo** (todo en el ledger de la base). Escalar a varias máquinas requiere
  un adaptador de Socket.IO con Redis.
- Pendiente de producto regulado: licencia de juego, KYC/AML, juego responsable, RNG certificado.
