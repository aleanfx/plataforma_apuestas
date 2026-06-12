"use client";

import * as React from "react";
import { toast } from "sonner";

import { api } from "@/lib/api";
import { formatBs } from "@/lib/money";
import { Check, Close, ArrowDownLine, ArrowUpAlt } from "@/components/icons";

type Req = {
  id: string;
  kind: "deposit" | "withdraw";
  method: string;
  amount: number; // céntimos
  userName: string;
  userEmail: string;
  createdAt: string;
};

const METHOD_LABEL: Record<string, string> = {
  nowpayments: "Criptomonedas",
  binance: "Binance",
  pagomovil: "Pago Móvil",
  daviplata: "Daviplata",
  nequi: "Nequi",
};

function ago(iso: string): string {
  const mins = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return "hace un momento";
  if (mins < 60) return `hace ${mins} min`;
  const h = Math.floor(mins / 60);
  if (h < 24) return `hace ${h} h`;
  return `hace ${Math.floor(h / 24)} d`;
}

export function AdminQueue() {
  const [reqs, setReqs] = React.useState<Req[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    api<{ requests: Req[] }>("/admin/requests")
      .then((r) => setReqs(r.requests))
      .catch(() => setReqs([]));
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  async function act(r: Req, action: "approve" | "reject") {
    const base = r.kind === "deposit" ? "/admin/deposits" : "/admin/withdrawals";
    setBusy(r.id);
    try {
      await api(`${base}/${r.id}/${action}`, { method: "POST" });
      toast.success(
        action === "approve" ? "Solicitud aprobada" : "Solicitud rechazada",
      );
      setReqs((prev) => prev?.filter((x) => x.id !== r.id) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo procesar");
      load(); // re-sincroniza por si cambió el estado
    } finally {
      setBusy(null);
    }
  }

  const count = reqs?.length ?? 0;

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h3 className="serif">Solicitudes pendientes</h3>
          <div className="sub">Aprueba o rechaza pagos</div>
        </div>
        <span className="pill pending">{count} en cola</span>
      </div>

      {reqs === null ? (
        <div style={{ padding: 24, color: "var(--text-2)" }}>Cargando…</div>
      ) : count === 0 ? (
        <div style={{ padding: 24, color: "var(--text-2)" }}>No hay solicitudes pendientes.</div>
      ) : (
        reqs.map((r) => {
          const isDep = r.kind === "deposit";
          return (
            <div className="q-item" key={r.id}>
              <div className={`q-ic ${isDep ? "dep" : "wd"}`}>
                {isDep ? <ArrowDownLine /> : <ArrowUpAlt />}
              </div>
              <div className="q-main">
                <div className="q-title">
                  {isDep ? "Depósito" : "Retiro"} · {METHOD_LABEL[r.method] ?? r.method}
                </div>
                <div className="q-sub">
                  {r.userName} · {ago(r.createdAt)}
                </div>
              </div>
              <div className="q-amt">{formatBs(r.amount)}</div>
              <div className="act-row">
                <button
                  className="icon-btn approve"
                  title="Aprobar"
                  disabled={busy === r.id}
                  onClick={() => act(r, "approve")}
                >
                  <Check strokeWidth={2} />
                </button>
                <button
                  className="icon-btn reject"
                  title="Rechazar"
                  disabled={busy === r.id}
                  onClick={() => act(r, "reject")}
                >
                  <Close strokeWidth={2} />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
