"use client";

import * as React from "react";

/**
 * Cuenta regresiva del turno. `endsAt` es un timestamp en ms (o null si no hay
 * turno activo). El servidor juega/pasa solo al llegar a 0, así que esto es solo
 * informativo para el jugador.
 */
export function TurnTimer({ endsAt, className }: { endsAt?: number | null; className?: string }) {
  const [secs, setSecs] = React.useState(0);

  React.useEffect(() => {
    if (!endsAt) {
      setSecs(0);
      return;
    }
    const tick = () => setSecs(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));
    tick();
    const t = setInterval(tick, 500);
    return () => clearInterval(t);
  }, [endsAt]);

  if (!endsAt) return null;
  return (
    <span className={`turn-timer${secs <= 5 ? " urgent" : ""}${className ? " " + className : ""}`}>
      {secs}s
    </span>
  );
}
