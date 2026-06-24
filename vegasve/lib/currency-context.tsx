"use client";

import * as React from "react";
import { api } from "@/lib/api";
import {
  type CurrencyCode,
  type Rates,
  DEFAULT_RATES,
  formatMoney,
  formatMoneyShort,
  formatEquivalents,
} from "@/lib/money";

type CurrencyContextValue = {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  rates: Rates;
  /** Formatea céntimos en la moneda activa. */
  fmt: (cents: number) => string;
  /** Formatea corto (badges). */
  fmtShort: (cents: number) => string;
  /** Muestra equivalencia en las otras dos monedas. */
  fmtEquiv: (cents: number) => string;
};

const CurrencyContext = React.createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = React.useState<CurrencyCode>("USD");
  const [rates, setRates] = React.useState<Rates>(DEFAULT_RATES);

  // Cargar preferencia guardada.
  React.useEffect(() => {
    const saved = localStorage.getItem("betmar_currency") as CurrencyCode | null;
    if (saved && ["VES", "USD", "COP"].includes(saved)) setCurrencyState(saved);
  }, []);

  // Obtener tasas del backend.
  React.useEffect(() => {
    let active = true;
    async function load() {
      try {
        const data = await api<{ usdToBs: number; usdToCop: number; updatedAt: string }>(
          "/rates",
          { auth: false },
        );
        if (active && data.usdToBs > 0 && data.usdToCop > 0) {
          setRates({ usdToBs: data.usdToBs, usdToCop: data.usdToCop });
        }
      } catch {
        /* usa los defaults */
      }
    }
    load();
    // Refrescar cada 30 min
    const id = setInterval(load, 30 * 60 * 1000);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, []);

  const setCurrency = React.useCallback((c: CurrencyCode) => {
    setCurrencyState(c);
    localStorage.setItem("betmar_currency", c);
  }, []);

  const fmt = React.useCallback(
    (cents: number) => formatMoney(cents, currency, rates),
    [currency, rates],
  );
  const fmtShort = React.useCallback(
    (cents: number) => formatMoneyShort(cents, currency, rates),
    [currency, rates],
  );
  const fmtEquiv = React.useCallback(
    (cents: number) => formatEquivalents(cents, currency, rates),
    [currency, rates],
  );

  const value = React.useMemo(
    () => ({ currency, setCurrency, rates, fmt, fmtShort, fmtEquiv }),
    [currency, setCurrency, rates, fmt, fmtShort, fmtEquiv],
  );

  return <CurrencyContext.Provider value={value}>{children}</CurrencyContext.Provider>;
}

export function useCurrency(): CurrencyContextValue {
  const ctx = React.useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency debe usarse dentro de <CurrencyProvider>");
  return ctx;
}
