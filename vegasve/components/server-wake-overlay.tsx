"use client";

import * as React from "react";

import { onServerStatus, getServerStatus, type ServerStatus } from "@/lib/server-status";

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
      </div>
    </div>
  );
}
