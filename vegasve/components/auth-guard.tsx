"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { ShieldCheck } from "@/components/icons";
import { toast } from "sonner";

function CurrencySetup({ onSelect }: { onSelect: (c: string) => Promise<void> }) {
  const [selected, setSelected] = React.useState<"VES" | "USD" | "COP" | null>(null);
  const [busy, setBusy] = React.useState(false);

  const options = [
    { code: "USD" as const, name: "🇺🇸 Dólares (USD)", desc: "Ideal para transacciones en divisas y criptomonedas." },
    { code: "VES" as const, name: "🇻🇪 Bolívares (VES)", desc: "Ideal si usas Pago Móvil como método principal." },
    { code: "COP" as const, name: "🇨🇴 Pesos Colombianos (COP)", desc: "Ideal si juegas desde Colombia con Nequi o Daviplata." },
  ];

  const handleConfirm = async () => {
    if (!selected || busy) return;
    setBusy(true);
    try {
      await onSelect(selected);
      toast.success("Moneda establecida correctamente.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar configuración");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "#0d0b1e",
        backgroundImage: "radial-gradient(circle at 50% 50%, #1e133a 0%, #0d0b1e 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 999999,
        padding: "20px",
        color: "var(--text)"
      }}
    >
      <div
        className="pcard"
        style={{
          width: "100%",
          maxWidth: "480px",
          padding: "36px 32px",
          border: "1px solid var(--line)",
          background: "rgba(255, 255, 255, 0.03)",
          backdropFilter: "blur(10px)",
          borderRadius: "16px",
          textAlign: "center"
        }}
      >
        <div style={{ display: "inline-flex", padding: "12px", background: "rgba(212,175,55,0.12)", borderRadius: "50%", color: "var(--gold)", marginBottom: "20px" }}>
          <ShieldCheck style={{ width: "32px", height: "32px" }} />
        </div>
        
        <h2 className="serif" style={{ fontSize: "24px", fontWeight: "700", marginBottom: "10px" }}>
          Selecciona tu moneda nativa
        </h2>
        
        <p style={{ fontSize: "13.5px", color: "var(--text-2)", marginBottom: "24px", lineHeight: "1.4" }}>
          Para comenzar a jugar, elige la moneda en la que se mostrarán tus saldos y jugadas. 
          <strong style={{ display: "block", marginTop: "6px", color: "var(--gold)" }}>
            Podrás cambiarlo luego desde tu perfil.
          </strong>
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "24px", textAlign: "left" }}>
          {options.map((opt) => {
            const active = selected === opt.code;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => setSelected(opt.code)}
                style={{
                  width: "100%",
                  display: "block",
                  padding: "14px 16px",
                  background: active ? "rgba(212,175,55,0.12)" : "rgba(255,255,255,0.02)",
                  border: active ? "1px solid var(--gold)" : "1px solid var(--line-soft)",
                  borderRadius: "10px",
                  color: active ? "var(--gold)" : "var(--text)",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  textAlign: "left"
                }}
              >
                <div style={{ fontWeight: "600", fontSize: "14px", marginBottom: "2px" }}>{opt.name}</div>
                <div style={{ fontSize: "11px", color: active ? "rgba(255,255,255,0.7)" : "var(--text-3)" }}>{opt.desc}</div>
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={!selected || busy}
          className="btn btn-gold btn-block"
          style={{ height: "46px", fontSize: "14px", fontWeight: "600" }}
        >
          {busy ? "Guardando..." : "Confirmar Selección"}
        </button>
      </div>
    </div>
  );
}

/** Protege una página: si no hay sesión, redirige a "/". Si `admin` y el usuario
 *  no es admin, redirige al lobby. Mientras carga muestra un loader simple. */
export function AuthGuard({
  children,
  admin = false,
}: {
  children: React.ReactNode;
  admin?: boolean;
}) {
  const { user, loading, updateCurrency } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/");
    } else if (admin && user.role !== "admin") {
      router.replace("/lobby");
    }
  }, [loading, user, admin, router]);

  const allowed = !!user && (!admin || user.role === "admin");
  if (loading || !allowed) {
    return (
      <div
        style={{
          minHeight: "60vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--text-2)",
        }}
      >
        Cargando…
      </div>
    );
  }

  // Si está logueado pero no ha elegido moneda nativa, bloquea con la selección.
  if (user && !user.currency) {
    return <CurrencySetup onSelect={updateCurrency} />;
  }

  return <>{children}</>;
}
