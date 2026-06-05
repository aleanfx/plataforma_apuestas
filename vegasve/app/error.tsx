"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // En producción aquí se reportaría a un servicio (Sentry, etc.)
    console.error(error);
  }, [error]);

  return (
    <section className="view">
      <div
        className="wrap"
        style={{
          minHeight: "70vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: 18,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="BetmarPlay" style={{ height: 60, marginBottom: 6 }} />
        <div className="eyebrow">Algo salió mal</div>
        <h1 style={{ fontSize: "clamp(30px, 5vw, 48px)" }}>Ocurrió un error inesperado</h1>
        <p style={{ color: "var(--text-2)", maxWidth: 440 }}>
          Estamos trabajando para resolverlo. Puedes reintentar o volver al inicio.
        </p>
        <div style={{ display: "flex", gap: 12, marginTop: 6, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn btn-gold" onClick={reset}>
            Reintentar
          </button>
          <Link href="/" className="btn btn-ghost">
            Volver al inicio
          </Link>
        </div>
      </div>
    </section>
  );
}
