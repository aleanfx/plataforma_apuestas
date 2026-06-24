"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";

export function AdminSettings() {
  const { rates } = useCurrency();
  const [usdToBs, setUsdToBs] = React.useState<number | "">("");
  const [usdToCop, setUsdToCop] = React.useState<number | "">("");
  const [minDepUsd, setMinDepUsd] = React.useState<number | "">("");
  const [minDepBs, setMinDepBs] = React.useState<number | "">("");
  const [busy, setBusy] = React.useState(false);

  // Sincronizar inputs cuando las tasas carguen
  React.useEffect(() => {
    if (rates) {
      setUsdToBs(rates.usdToBs);
      setUsdToCop(rates.usdToCop);
      setMinDepUsd(rates.minDepUsd);
      setMinDepBs(rates.minDepBs);
    }
  }, [rates]);

  async function handleSave() {
    if (busy) return;
    if (usdToBs === "" || usdToCop === "" || minDepUsd === "" || minDepBs === "") {
      toast.error("Por favor, completa todos los campos con valores válidos.");
      return;
    }

    setBusy(true);
    try {
      await api("/rates/admin", {
        method: "POST",
        body: {
          usdToBs: Number(usdToBs),
          usdToCop: Number(usdToCop),
          minDepUsd: Number(minDepUsd),
          minDepBs: Number(minDepBs),
        },
      });
      toast.success("Configuración guardada correctamente. Se aplicará en el próximo refresco.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al guardar configuración");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h3 className="serif">Configuración del Sistema</h3>
          <div className="sub">Modifica las tasas de cambio y depósitos mínimos</div>
        </div>
      </div>
      
      <div style={{ padding: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--text-3)", marginBottom: "6px" }}>Tasa USD a Bs (BCV)</label>
            <input
              type="number"
              style={{
                width: "100%",
                background: "var(--black-2)",
                border: "1px solid var(--line-soft)",
                borderRadius: "8px",
                padding: "10px",
                color: "var(--text)",
                fontSize: "14px"
              }}
              placeholder="Ej. 620"
              value={usdToBs}
              onChange={(e) => setUsdToBs(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--text-3)", marginBottom: "6px" }}>Tasa USD a COP</label>
            <input
              type="number"
              style={{
                width: "100%",
                background: "var(--black-2)",
                border: "1px solid var(--line-soft)",
                borderRadius: "8px",
                padding: "10px",
                color: "var(--text)",
                fontSize: "14px"
              }}
              placeholder="Ej. 3400"
              value={usdToCop}
              onChange={(e) => setUsdToCop(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--text-3)", marginBottom: "6px" }}>Mínimo Depósito USD (Cripto, Binance, COP)</label>
            <input
              type="number"
              style={{
                width: "100%",
                background: "var(--black-2)",
                border: "1px solid var(--line-soft)",
                borderRadius: "8px",
                padding: "10px",
                color: "var(--text)",
                fontSize: "14px"
              }}
              placeholder="Ej. 1"
              value={minDepUsd}
              onChange={(e) => setMinDepUsd(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: "11px", color: "var(--text-3)", marginBottom: "6px" }}>Mínimo Depósito Bs (Pago Móvil)</label>
            <input
              type="number"
              style={{
                width: "100%",
                background: "var(--black-2)",
                border: "1px solid var(--line-soft)",
                borderRadius: "8px",
                padding: "10px",
                color: "var(--text)",
                fontSize: "14px"
              }}
              placeholder="Ej. 500"
              value={minDepBs}
              onChange={(e) => setMinDepBs(e.target.value === "" ? "" : Number(e.target.value))}
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={busy}
          className="btn btn-gold btn-block"
          style={{ height: "42px", fontSize: "13.5px", fontWeight: "600" }}
        >
          {busy ? "Guardando..." : "Guardar Configuración"}
        </button>
      </div>
    </div>
  );
}
