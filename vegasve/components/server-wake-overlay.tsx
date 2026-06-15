"use client";

import * as React from "react";

import {
  onServerStatus,
  getServerStatus,
  prewarmServer,
  retryServerNow,
  type ServerStatus,
} from "@/lib/server-status";

/**
 * Overlay a pantalla completa que aparece SOLO cuando el backend está dormido y
 * arrancando (plan free de Render duerme tras 15 min sin tráfico, ~1 min en
 * despertar). Se quita solo en cuanto el servidor vuelve a responder.
 */
export function ServerWakeOverlay() {
  const [status, setStatus] = React.useState<ServerStatus>("online");
  const [elapsed, setElapsed] = React.useState(0);

  React.useEffect(() => {
    setStatus(getServerStatus());
    prewarmServer(); // al abrir la web, empieza a despertar el servidor en segundo plano
    return onServerStatus(setStatus);
  }, []);

  React.useEffect(() => {
    if (status !== "waking") {
      setElapsed(0);
      return;
    }
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [status]);

  if (status !== "waking") return null;

  return (
    <div className="wake-overlay" role="status" aria-live="polite">
      <div className="wake-card">
        <div className="wake-spinner" aria-hidden />
        <h2 className="wake-title serif">Preparando la mesa…</h2>
        <p className="wake-sub">
          El servidor estaba en reposo y se está encendiendo. Esto puede tardar hasta un
          minuto. Tu saldo y tus partidas están a salvo — no cierres la página.
        </p>
        <div className="wake-bar" aria-hidden>
          <span />
        </div>
        <div className="wake-elapsed">Reconectando… {elapsed}s</div>
        <div className="wake-actions">
          <button type="button" className="wake-btn" onClick={() => void retryServerNow()}>
            Reintentar ahora
          </button>
          {elapsed >= 60 && (
            <button type="button" className="wake-btn ghost" onClick={() => window.location.reload()}>
              Recargar página
            </button>
          )}
        </div>
        {elapsed >= 60 && (
          <p className="wake-hint">
            Tras una actualización el servidor puede tardar 2–3 min en encender. Si sigue así,
            recarga en un momento.
          </p>
        )}
      </div>
    </div>
  );
}
