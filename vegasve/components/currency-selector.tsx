"use client";

import * as React from "react";
import { useCurrency } from "@/lib/currency-context";
import type { CurrencyCode } from "@/lib/money";

const OPTIONS: { code: CurrencyCode; flag: string; label: string }[] = [
  { code: "USD", flag: "🇺🇸", label: "USD" },
  { code: "VES", flag: "🇻🇪", label: "Bs" },
  { code: "COP", flag: "🇨🇴", label: "COP" },
];

export function CurrencySelector() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function close(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, []);

  const active = OPTIONS.find((o) => o.code === currency)!;

  return (
    <div className="cur-sel" ref={ref}>
      <button className="cur-sel-btn" onClick={() => setOpen(!open)} title="Moneda">
        <span>{active.flag}</span>
        <span>{active.label}</span>
      </button>
      {open && (
        <div className="cur-sel-drop">
          {OPTIONS.map((o) => (
            <button
              key={o.code}
              className={`cur-sel-opt${o.code === currency ? " active" : ""}`}
              onClick={() => {
                setCurrency(o.code);
                setOpen(false);
              }}
            >
              <span>{o.flag}</span>
              <span>{o.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
