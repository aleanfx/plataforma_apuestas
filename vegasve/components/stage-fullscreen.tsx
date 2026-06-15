"use client";

import * as React from "react";

import { Expand, Compress } from "@/components/icons";

/**
 * Botón de pantalla completa que afecta SOLO al recuadro del juego (el elemento
 * que se le pasa por `targetRef`), no a toda la interfaz.
 * - PC y Android: usa la Fullscreen API real.
 * - iPhone/Safari: la API no deja poner en pantalla completa un <div>, así que
 *   se usa un "pantalla completa simulada" (position: fixed que cubre la pantalla).
 */
export function StageFullscreen({ targetRef }: { targetRef: React.RefObject<HTMLElement> }) {
  const [fs, setFs] = React.useState(false);
  const [faux, setFaux] = React.useState(false);

  React.useEffect(() => {
    const onChange = () => setFs(document.fullscreenElement === targetRef.current);
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, [targetRef]);

  // Modo simulado (iPhone): añade/quita la clase y avisa para reajustar el tablero.
  React.useEffect(() => {
    const el = targetRef.current;
    if (!el) return;
    el.classList.toggle("stage-faux-fs", faux);
    const t = setTimeout(() => window.dispatchEvent(new Event("resize")), 80);
    return () => clearTimeout(t);
  }, [faux, targetRef]);

  // Esc para salir del modo simulado
  React.useEffect(() => {
    if (!faux) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFaux(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [faux]);

  function toggle() {
    const el = targetRef.current as
      | (HTMLElement & { webkitRequestFullscreen?: () => Promise<void> })
      | null;
    const doc = document as Document & { webkitExitFullscreen?: () => Promise<void> };
    if (document.fullscreenElement) {
      (doc.exitFullscreen ?? doc.webkitExitFullscreen)?.call(doc);
      return;
    }
    if (faux) {
      setFaux(false);
      return;
    }
    const req = el?.requestFullscreen ?? el?.webkitRequestFullscreen;
    if (req && el) {
      Promise.resolve(req.call(el)).catch(() => setFaux(true));
    } else {
      setFaux(true); // iPhone/Safari: sin Fullscreen API -> simulado
    }
  }

  const active = fs || faux;
  return (
    <button
      type="button"
      className="stage-fs"
      onClick={toggle}
      title={active ? "Salir de pantalla completa" : "Pantalla completa"}
      aria-label={active ? "Salir de pantalla completa" : "Pantalla completa"}
    >
      {active ? <Compress width="1em" height="1em" /> : <Expand width="1em" height="1em" />}
    </button>
  );
}
