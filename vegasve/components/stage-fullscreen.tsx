"use client";

import * as React from "react";

/**
 * Botón de pantalla completa que afecta SOLO al recuadro del juego (el elemento
 * que se le pasa por `targetRef`), no a toda la interfaz. PC y Android.
 */
export function StageFullscreen({ targetRef }: { targetRef: React.RefObject<HTMLElement> }) {
  const [fs, setFs] = React.useState(false);

  React.useEffect(() => {
    const onChange = () => setFs(document.fullscreenElement === targetRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  function toggle() {
    const el = targetRef.current as
      | (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (document.fullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
    } else if (el) {
      (el.requestFullscreen ?? el.webkitRequestFullscreen)?.call(el);
    }
  }

  return (
    <button
      type="button"
      className="stage-fs"
      onClick={toggle}
      title={fs ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-label={fs ? "Salir de pantalla completa" : "Pantalla completa"}
    >
      {fs ? "🗗" : "⛶"}
    </button>
  );
}
