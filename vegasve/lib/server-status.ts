// Estado de disponibilidad del backend.
// El plan free de Render DUERME tras 15 min sin tráfico y tarda ~1 min en despertar.
// Durante ese arranque mostramos un overlay "preparando la mesa" (ver
// components/server-wake-overlay.tsx) en vez de dejar al usuario esperando a ciegas.
// Esto SOLO se activa cuando el servidor de verdad no responde, no en uso normal.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

export type ServerStatus = "online" | "waking";

let status: ServerStatus = "online";
let polling = false;
const listeners = new Set<(s: ServerStatus) => void>();

function emit() {
  listeners.forEach((l) => l(status));
}

export function getServerStatus(): ServerStatus {
  return status;
}

/** Suscribe a cambios de estado. Devuelve la función para desuscribir. */
export function onServerStatus(cb: (s: ServerStatus) => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

/** Marca el servidor como "despertando": muestra el overlay y arranca el sondeo. */
export function markServerWaking() {
  if (status === "waking") return;
  status = "waking";
  emit();
  startPolling();
}

/** Marca el servidor como disponible (oculta el overlay). */
export function markServerOnline() {
  if (status === "online") return;
  status = "online";
  emit();
}

/** Hace ping a /health con timeout. true si el servidor respondió OK. */
async function pingHealth(timeoutMs = 4000): Promise<boolean> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs);
    const res = await fetch(`${API_URL}/health`, { signal: ctrl.signal, cache: "no-store" });
    clearTimeout(t);
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Ante un error de conexión del socket, confirma con /health ANTES de mostrar el
 * overlay. Así evitamos falsos positivos (p. ej. un rechazo de auth, donde el
 * servidor sí está vivo). Solo si /health también falla, el servidor está dormido.
 */
export async function reportConnectionError() {
  if (status === "waking") return;
  if (!(await pingHealth(3000))) markServerWaking();
}

/** Pre-encendido silencioso: al abrir la web hace un ping a /health para que
 *  Render empiece a despertar ANTES de que el usuario intente entrar (sin overlay). */
export function prewarmServer() {
  void pingHealth(9000);
}

/** Reintento manual (botón del overlay): pinguea ya; si responde, oculta el overlay. */
export async function retryServerNow(): Promise<void> {
  if (await pingHealth(6000)) markServerOnline();
}

/** Mientras esté "waking", sondea /health hasta que responda; entonces vuelve a online. */
function startPolling() {
  if (polling) return;
  polling = true;
  const loop = async () => {
    if (status !== "waking") {
      polling = false;
      return;
    }
    if (await pingHealth()) {
      markServerOnline();
      polling = false;
      return;
    }
    setTimeout(loop, 3000);
  };
  setTimeout(loop, 1500);
}
