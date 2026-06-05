import Link from "next/link";

export default function NotFound() {
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
        <div className="eyebrow">Error 404</div>
        <h1 style={{ fontSize: "clamp(34px, 6vw, 56px)" }}>Página no encontrada</h1>
        <p style={{ color: "var(--text-2)", maxWidth: 440 }}>
          La página que buscas no existe o fue movida. Vuelve al inicio para seguir jugando.
        </p>
        <Link href="/" className="btn btn-gold" style={{ marginTop: 6 }}>
          Volver al inicio
        </Link>
      </div>
    </section>
  );
}
