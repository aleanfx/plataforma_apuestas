"use client";

import * as React from "react";

import { sfx } from "@/lib/sfx";

/**
 * Botón flotante de silencio (abajo a la derecha). También desbloquea el audio
 * en el primer gesto del usuario (política de autoplay de los navegadores).
 */
export function SoundToggle() {
  const [muted, setMuted] = React.useState(true);

  React.useEffect(() => {
    setMuted(sfx.isMuted());
    const unlock = () => sfx.unlock();
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => window.removeEventListener("pointerdown", unlock);
  }, []);

  return (
    <button
      type="button"
      className="sound-toggle"
      aria-label={muted ? "Activar sonido" : "Silenciar"}
      title={muted ? "Activar sonido" : "Silenciar"}
      onClick={() => setMuted(sfx.toggle())}
    >
      {muted ? "🔇" : "🔊"}
    </button>
  );
}
