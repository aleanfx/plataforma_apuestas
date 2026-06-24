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
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/lib/currency-context";
import { api } from "@/lib/api";
import {
  formatMoney,
  formatEquivalents,
  localToCents,
  currencySymbol,
  methodCurrency,
  type CurrencyCode,
} from "@/lib/money";

type Method = {
  id: string;
  name: string;
  depSub: string;
  wdSub: string;
  ic: string;
  icStyle: React.CSSProperties;
  /* datos de destino que se muestran al depositar */
  details: { k: string; v: string }[];
  /** ¿Requiere comprobante? (false = auto-confirmación vía API) */
  needsProof: boolean;
};

const METHODS: Method[] = [
  {
    id: "nowpayments",
    name: "Criptomonedas",
    depSub: "NowPayments · mín. $5",
    wdSub: "Cripto",
    ic: "₿",
    icStyle: { background: "rgba(6,182,212,0.15)", color: "#06b6d4" },
    details: [
      { k: "Red", v: "Cualquier criptomoneda" },
      { k: "Mínimo", v: "$5 USD" },
    ],
    needsProof: false, // se confirma automáticamente con NowPayments (pendiente de API key)
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
    needsProof: true,
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
    needsProof: true,
  },
  {
    id: "daviplata",
    name: "Daviplata",
    depSub: "Colombia (COP)",
    wdSub: "Colombia",
    ic: "D",
    icStyle: { background: "rgba(236,72,153,0.16)", color: "#ec4899" },
    details: [{ k: "Daviplata", v: "301 913 7963" }],
    needsProof: true,
  },
  {
    id: "nequi",
    name: "Nequi",
    depSub: "Colombia (COP)",
    wdSub: "Colombia",
    ic: "N",
    icStyle: { background: "rgba(147,51,234,0.16)", color: "#9333ea" },
    details: [{ k: "Nequi", v: "311 342 5060" }],
    needsProof: true,
  },
];

/** Comprime imagen a JPEG data URL (max 500 KB). */
async function compressProof(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const MAX = 1200;
        let w = img.width;
        let h = img.height;
        if (w > MAX || h > MAX) {
          const ratio = Math.min(MAX / w, MAX / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        canvas.width = w;
        canvas.height = h;
        canvas.getContext("2d")!.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        if (dataUrl.length > 500_000) {
          // Intenta con más compresión
          const smaller = canvas.toDataURL("image/jpeg", 0.5);
          resolve(smaller);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => reject(new Error("No se pudo leer la imagen"));
      img.src = reader.result as string;
    };
    reader.onerror = () => reject(new Error("No se pudo leer el archivo"));
    reader.readAsDataURL(file);
  });
}

export function WalletDialog({
  children,
  kind,
}: {
  children: React.ReactNode;
  kind: "deposit" | "withdraw";
}) {
  const { user, refreshUser } = useAuth();
  const { currency, rates } = useCurrency();
  const [open, setOpen] = React.useState(false);
  const [method, setMethod] = React.useState("nowpayments");
  const [amount, setAmount] = React.useState<number | "">("");
  const [dest, setDest] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  const [proofUrl, setProofUrl] = React.useState<string | null>(null);
  const [proofName, setProofName] = React.useState<string>("");
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setMethod("nowpayments");
      setAmount("");
      setDest("");
      setBusy(false);
      setProofUrl(null);
      setProofName("");
    }
  }, [open]);

  const isDep = kind === "deposit";
  const active = METHODS.find((m) => m.id === method)!;

  // Moneda del monto según el método de pago
  const inputCurrency: CurrencyCode = isDep ? methodCurrency(method) : currency;
  const sym = currencySymbol(inputCurrency);

  const value = typeof amount === "number" ? amount : 0;
  // Convertir monto local a céntimos internos
  const cents = localToCents(value, inputCurrency, rates);
  // Texto de equivalencia en las otras monedas
  const equivText = cents > 0 ? formatEquivalents(cents, inputCurrency, rates) : "";

  const availableCents = user?.balance ?? 0;

  // Quick amounts según la moneda del input
  const quick = isDep
    ? inputCurrency === "VES"
      ? [
          { label: "Bs. 2.000", v: 2000 },
          { label: "Bs. 5.000", v: 5000 },
          { label: "Bs. 10.000", v: 10000 },
          { label: "Bs. 20.000", v: 20000 },
        ]
      : inputCurrency === "COP"
        ? [
            { label: "COP 10.000", v: 10000 },
            { label: "COP 20.000", v: 20000 },
            { label: "COP 50.000", v: 50000 },
            { label: "COP 100.000", v: 100000 },
          ]
        : [
            { label: "$5", v: 5 },
            { label: "$10", v: 10 },
            { label: "$20", v: 20 },
            { label: "$50", v: 50 },
          ]
    : [
        { label: formatMoney(200000, currency, rates), v: 2000 },
        { label: formatMoney(500000, currency, rates), v: 5000 },
        { label: "Todo", v: Math.floor(availableCents / 100) },
      ];

  async function handleProofFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Selecciona una imagen (JPG, PNG, etc.)");
      return;
    }
    try {
      const url = await compressProof(file);
      setProofUrl(url);
      setProofName(file.name);
    } catch {
      toast.error("No se pudo procesar la imagen");
    }
  }

  async function confirm() {
    if (busy) return;
    if (value <= 0) {
      toast.error("Ingresa un monto válido.");
      return;
    }
    if (cents < 1000) {
      toast.error("El monto mínimo equivale a Bs. 10.");
      return;
    }
    if (!isDep && cents > availableCents) {
      toast.error("El monto supera tu saldo disponible para retiro.");
      return;
    }
    if (!isDep && dest.trim().length < 3) {
      toast.error("Indica la cuenta o billetera donde recibir.");
      return;
    }
    // Comprobante obligatorio para métodos manuales
    if (isDep && active.needsProof && !proofUrl) {
      toast.error("Adjunta la captura del comprobante de pago.");
      return;
    }

    setBusy(true);
    try {
      if (isDep) {
        await api("/wallet/deposit", {
          method: "POST",
          body: {
            method,
            amount: cents,
            reference: `${sym} ${value}`,
            proofUrl: proofUrl ?? undefined,
          },
        });
        setOpen(false);
        toast.success("Depósito en revisión — se acreditará al confirmar tu pago.");
      } else {
        await api("/wallet/withdraw", {
          method: "POST",
          body: { method, amount: cents, destination: dest.trim() },
        });
        setOpen(false);
        toast.success("Solicitud de retiro enviada — la procesaremos en breve.");
      }
      await refreshUser();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo completar la operación.");
    } finally {
      setBusy(false);
    }
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
                Disponible para retiro:{" "}
                <span className="gold">{formatMoney(availableCents, currency, rates)}</span>
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
                <input
                  type="text"
                  placeholder="ID, dirección o teléfono donde recibir"
                  value={dest}
                  onChange={(e) => setDest(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="field amount-field">
            <label>{isDep ? "Monto a depositar" : "Monto a retirar"}</label>
            <div className="input-wrap">
              <span className="cur">{sym}</span>
              <input
                type="number"
                placeholder="0"
                min={1}
                step={inputCurrency === "USD" ? 1 : 100}
                value={amount}
                style={{
                  paddingLeft:
                    inputCurrency === "COP"
                      ? "90px"
                      : inputCurrency === "VES"
                      ? "75px"
                      : "50px",
                }}
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

          {/* Equivalencia en otras monedas */}
          {equivText && <div className="equiv-line">≈ {equivText}</div>}

          {/* Upload de comprobante (solo para métodos manuales en depósito) */}
          {isDep && active.needsProof && (
            <div className="proof-upload">
              <label>Comprobante de pago *</label>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleProofFile}
              />
              <div
                className={`proof-drop${proofUrl ? " has-file" : ""}`}
                onClick={() => fileRef.current?.click()}
              >
                {proofUrl ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={proofUrl} alt="Comprobante" className="proof-thumb" />
                    <div className="proof-name">{proofName}</div>
                    <button
                      className="proof-remove"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProofUrl(null);
                        setProofName("");
                        if (fileRef.current) fileRef.current.value = "";
                      }}
                    >
                      Quitar
                    </button>
                  </>
                ) : (
                  <>📎 Toca para adjuntar la captura del pago</>
                )}
              </div>
            </div>
          )}

          <div style={{ margin: "18px 0 4px" }}>
            <div className="summary-row">
              <span className="lbl">Total a acreditar</span>
              <span className="val">{cents > 0 ? formatMoney(cents, currency, rates) : "—"}</span>
            </div>
          </div>

          <button
            className={`btn ${isDep ? "btn-gold" : "btn-green"} btn-block`}
            style={{ marginTop: 14 }}
            onClick={confirm}
            disabled={busy}
          >
            {busy
              ? "Procesando…"
              : isDep
                ? "Confirmar depósito"
                : "Solicitar retiro"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
