"use client";

// Conversión de monto en USD a criptomoneda con precios EN VIVO.
// Usa la API pública y gratuita de CoinGecko (con CORS habilitado, sin API key).
// Esta es la "lógica pura" del flujo cripto: NowPayments generará la dirección
// de pago real cuando se configure su API key; mientras tanto, aquí se calcula
// exactamente cuánta cripto equivale al monto en dólares que el cliente elija.

import * as React from "react";

export type CryptoCoin = {
  /** id de CoinGecko (para el endpoint de precios) */
  id: string;
  /** ticker mostrado al usuario */
  symbol: string;
  name: string;
  /** red sugerida (informativo) */
  net?: string;
  /** color de marca para el disco del logo */
  color: string;
};

// Criptos más usadas para depósitos en LATAM. USDT/USDC son las preferidas
// por estabilidad (1:1 con el dólar).
export const COINS: CryptoCoin[] = [
  { id: "tether", symbol: "USDT", name: "Tether", net: "TRC-20", color: "#26a17b" },
  { id: "usd-coin", symbol: "USDC", name: "USD Coin", net: "ERC-20", color: "#2775ca" },
  { id: "bitcoin", symbol: "BTC", name: "Bitcoin", net: "BTC", color: "#f7931a" },
  { id: "ethereum", symbol: "ETH", name: "Ethereum", net: "ERC-20", color: "#627eea" },
  { id: "binancecoin", symbol: "BNB", name: "BNB", net: "BEP-20", color: "#f3ba2f" },
  { id: "tron", symbol: "TRX", name: "TRON", net: "TRC-20", color: "#ef0027" },
  { id: "litecoin", symbol: "LTC", name: "Litecoin", net: "LTC", color: "#345d9d" },
  { id: "solana", symbol: "SOL", name: "Solana", net: "SOL", color: "#14b8a6" },
];

export type Prices = Record<string, number>; // id -> precio en USD

let cache: { at: number; prices: Prices } | null = null;
const CACHE_MS = 90_000; // 90 s

/** Obtiene los precios en USD de las criptos soportadas (con caché de 90 s). */
export async function fetchCryptoPrices(): Promise<Prices> {
  if (cache && Date.now() - cache.at < CACHE_MS) return cache.prices;
  const ids = COINS.map((c) => c.id).join(",");
  const res = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`,
    { headers: { accept: "application/json" } },
  );
  if (!res.ok) throw new Error("No se pudieron cargar las tasas cripto");
  const data = (await res.json()) as Record<string, { usd?: number }>;
  const prices: Prices = {};
  for (const c of COINS) prices[c.id] = data[c.id]?.usd ?? 0;
  cache = { at: Date.now(), prices };
  return prices;
}

/** Hook: carga precios cuando `enabled` y los refresca cada 90 s. */
export function useCryptoPrices(enabled: boolean) {
  const [prices, setPrices] = React.useState<Prices | null>(cache?.prices ?? null);
  const [error, setError] = React.useState(false);

  React.useEffect(() => {
    if (!enabled) return;
    let active = true;
    const run = () =>
      fetchCryptoPrices()
        .then((p) => active && (setPrices(p), setError(false)))
        .catch(() => active && setError(true));
    run();
    const id = setInterval(run, CACHE_MS);
    return () => {
      active = false;
      clearInterval(id);
    };
  }, [enabled]);

  return { prices, error };
}

/** Cantidad de cripto = USD / precio. Devuelve 0 si no hay precio aún. */
export function usdToCrypto(usd: number, priceUsd: number): number {
  if (!isFinite(usd) || !isFinite(priceUsd) || priceUsd <= 0) return 0;
  return usd / priceUsd;
}

/** Formatea una cantidad de cripto con decimales adecuados al tamaño. */
export function fmtCrypto(n: number): string {
  if (!isFinite(n) || n <= 0) return "0";
  if (n >= 1000) return n.toLocaleString("en-US", { maximumFractionDigits: 2 });
  if (n >= 1) return n.toLocaleString("en-US", { maximumFractionDigits: 4 });
  return n.toLocaleString("en-US", { maximumFractionDigits: 8 });
}
