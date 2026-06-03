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

const RATE = 40; // tasa demo Bs/USD

type Method = {
  id: string;
  name: string;
  depSub: string;
  wdSub: string;
  ic: string;
  icStyle: React.CSSProperties;
  /* datos de destino que se muestran al depositar */
  details: { k: string; v: string }[];
};

const METHODS: Method[] = [
  {
    id: "nowpayments",
    name: "NowPayments",
    depSub: "Cripto · mín. $5",
    wdSub: "Cripto",
    ic: "₿",
    icStyle: { background: "rgba(6,182,212,0.15)", color: "#06b6d4" },
    details: [
      { k: "Red", v: "Cualquier criptomoneda" },
      { k: "Mínimo", v: "$5 USD" },
    ],
  },
  {
    id: "binance",
    name: "Binance",
    depSub: "Binance Pay",
    wdSub: "Binance Pay",
    ic: "B",
    icStyle: { background: "rgba(245,158,11,0.16)", color: "#f5b30b" },
    details: [
      { k: "Binance ID", v: "184656251" },
      { k: "Acepta", v: "Cualquier cripto" },
    ],
  },
  {
    id: "pagomovil",
    name: "Pago Móvil",
    depSub: "Banco Venezolano de Crédito",
    wdSub: "Bancos VE",
    ic: "Pm",
    icStyle: { background: "rgba(147,51,234,0.16)", color: "#a855f7" },
    details: [
      { k: "Teléfono", v: "0426 660 3848" },
      { k: "C.I.", v: "20.090.138" },
      { k: "Banco", v: "Venezolano de Crédito" },
    ],
  },
  {
    id: "daviplata",
    name: "Daviplata",
    depSub: "Colombia (COP)",
    wdSub: "Colombia",
    ic: "D",
    icStyle: { background: "rgba(236,72,153,0.16)", color: "#ec4899" },
    details: [{ k: "Daviplata", v: "301 913 7963" }],
  },
  {
    id: "nequi",
    name: "Nequi",
    depSub: "Colombia (COP)",
    wdSub: "Colombia",
    ic: "N",
    icStyle: { background: "rgba(147,51,234,0.16)", color: "#9333ea" },
    details: [{ k: "Nequi", v: "311 342 5060" }],
  },
];

export function WalletDialog({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind: "deposit" | "withdraw";
}) {
  const [open, setOpen] = React.useState(false);
  const [method, setMethod] = React.useState("nowpayments");
  const [amount, setAmount] = React.useState<number | "">("");

  React.useEffect(() => {
    if (!open) {
      setMethod("nowpayments");
      setAmount("");
    }
  }, [open]);

  const value = typeof amount === "number" ? amount : 0;
  const usd = (value / RATE).toFixed(2);
  const totalLabel = "Bs. " + value.toLocaleString("es-VE");

  const isDep = kind === "deposit";
  const active = METHODS.find((m) => m.id === method)!;

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
          <DialogTitle className="serif" style={{ fontSize: 30, fontWeight: 700 }}>
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

          {isDep ? (
            <div className="pay-details">
              <div className="pay-details-head">
                Envía tu pago a <span className="gold">{active.name}</span>
              </div>
              {active.details.map((d) => (
                <div className="pay-row" key={d.k}>
                  <span className="pay-k">{d.k}</span>
                  <span className="pay-v">{d.v}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="field">
              <label>Cuenta / billetera destino</label>
              <div className="input-wrap">
                <CardAccount />
                <input type="text" placeholder="ID, dirección o teléfono donde recibir" />
              </div>
            </div>
          )}

          <div className="field amount-field">
            <label>{isDep ? "Monto a depositar" : "Monto a retirar"}</label>
            <div className="input-wrap">
              <span className="cur">Bs.</span>
              <input
                type="number"
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
              <span>≈ ${usd}</span>
            </div>
            <div className="summary-row">
              <span className="lbl">{isDep ? "Comisión" : "Comisión de red"}</span>
              <span>{isDep ? "Sin comisión" : "Bs. 0"}</span>
            </div>
            <div className="summary-row total">
              <span className="lbl">{isDep ? "Total a acreditar" : "Recibes"}</span>
              <span className="val">{totalLabel}</span>
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
