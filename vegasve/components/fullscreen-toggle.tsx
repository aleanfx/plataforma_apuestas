"use client";

import * as React from "react";

/** Botón flotante para entrar/salir de pantalla completa (PC y Android). */
export function FullscreenToggle() {
  const [fs, setFs] = React.useState(false);

  React.useEffect(() => {
    const onChange = () => setFs(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  function toggle() {
    const el = document.documentElement as HTMLElement & {
      webkitRequestFullscreen?: () => Promise<void>;
    };
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (document.fullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
    } else {
      (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
    }
  }

  return (
    <button
      type="button"
      className="fs-toggle"
      onClick={toggle}
      title={fs ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-label={fs ? "Salir de pantalla completa" : "Pantalla completa"}
    >
      {fs ? "🗗" : "⛶"}
    </button>
  );
}
