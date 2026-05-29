"use client";

import * as React from "react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { CardAccount } from "@/components/icons";

const RATE = 40; // demo rate Bs/USD

type Method = { id: string; name: string; depSub: string; wdSub: string; ic: string; icStyle: React.CSSProperties };

const METHODS: Method[] = [
  { id: "binance", name: "Binance Pay", depSub: "Instantáneo", wdSub: "Hasta 1 h", ic: "B", icStyle: { background: "rgba(240,185,11,0.14)", color: "#f0b90b" } },
  { id: "usdt", name: "USDT (TRC-20)", depSub: "Cripto · 1–3 min", wdSub: "Cripto", ic: "₮", icStyle: { background: "rgba(38,161,123,0.14)", color: "#26a17b" } },
  { id: "pm", name: "Pago Móvil", depSub: "Bancos VE", wdSub: "Bancos VE", ic: "Pm", icStyle: { background: "rgba(201,168,76,0.14)", color: "var(--gold)" } },
  { id: "zelle", name: "Zelle", depSub: "USD", wdSub: "USD", ic: "Z", icStyle: { background: "rgba(122,72,201,0.16)", color: "#a06ff0" } },
];

export function WalletDialog({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind: "deposit" | "withdraw";
}) {
  const [open, setOpen] = React.useState(false);
  const [method, setMethod] = React.useState("binance");
  const [amount, setAmount] = React.useState<number | "">("");

  React.useEffect(() => {
    if (!open) {
      setMethod("binance");
      setAmount("");
    }
  }, [open]);

  const value = typeof amount === "number" ? amount : 0;
  const usd = (value / RATE).toFixed(2);
  const totalLabel = "Bs. " + value.toLocaleString("es-VE");

  const isDep = kind === "deposit";
  const quick = isDep
    ? [
        { label: "Bs. 2.000", v: 2000 },
        { label: "Bs. 4.000", v: 4000 },
        { label: "Bs. 10.000", v: 10000 },
        { label: "Bs. 20.000", v: 20000 },
      ]
    : [
        { label: "Bs. 2.000", v: 2000 },
        { label: "Bs. 5.000", v: 5000 },
        { label: "Todo", v: 10980 },
      ];

  function confirm() {
    setOpen(false);
    toast.success(
      isDep ? "Depósito en proceso — se reflejará en breve" : "Solicitud de retiro enviada",
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-[520px]">
        <div className="modal-top">
          <div className="eyebrow">Cartera</div>
          <DialogTitle className="serif" style={{ fontSize: 30, fontWeight: 600 }}>
            {isDep ? "Depositar fondos" : "Retirar fondos"}
          </DialogTitle>
          <DialogDescription className="msub">
            {isDep ? (
              "Elige tu método y monto. El saldo se acredita al confirmar."
            ) : (
              <>
                Disponible para retiro: <span className="gold">Bs. 10.980</span> (excl. bono)
              </>
            )}
          </DialogDescription>
        </div>

        <div className="modal-body">
          <div className="methods">
            {METHODS.map((m) => (
              <button
                key={m.id}
                className={`method${method === m.id ? " active" : ""}`}
                onClick={() => setMethod(m.id)}
              >
                <div className="m-ic" style={m.icStyle}>
                  {m.ic}
                </div>
                <div>
                  <div className="m-name">{m.name}</div>
                  <div className="m-sub">{isDep ? m.depSub : m.wdSub}</div>
                </div>
              </button>
            ))}
          </div>

          {!isDep && (
            <div className="field">
              <label>Cuenta / billetera destino</label>
              <div className="input-wrap">
                <CardAccount />
                <input type="text" placeholder="ID de Binance, dirección o teléfono" />
              </div>
            </div>
          )}

          <div className="field amount-field">
            <label>{isDep ? "Monto a depositar" : "Monto a retirar"}</label>
            <div className="input-wrap">
              <span className="cur">Bs.</span>
              <input
                type="number"
                className="amount-input"
                placeholder="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value === "" ? "" : Number(e.target.value))}
              />
            </div>
            <div className="quick-amts">
              {quick.map((q) => (
                <button key={q.label} onClick={() => setAmount(q.v)}>
                  {q.label}
                </button>
              ))}
            </div>
          </div>

          <div style={{ margin: "18px 0 4px" }}>
            <div className="summary-row">
              <span className="lbl">Equivalente</span>
              <span className="sum-usd">≈ ${usd}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">{isDep ? "Comisión" : "Comisión de red"}</span>
              <span>{isDep ? "Sin comisión" : "Bs. 0"}</span>
            </div>
            <div className="summary-row total">
              <span className="lbl">{isDep ? "Total a acreditar" : "Recibes"}</span>
              <span className="val sum-total">{totalLabel}</span>
            </div>
          </div>

          <button
            className={`btn ${isDep ? "btn-gold" : "btn-green"} btn-block`}
            style={{ marginTop: 14 }}
            onClick={confirm}
          >
            {isDep ? "Confirmar depósito" : "Solicitar retiro"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
