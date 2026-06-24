// Servicio de tasas de cambio. Cachea en memoria y re-consulta cada 6 horas.
// Fuentes: dolarapi.com (BCV oficial para Bs/USD) + open.er-api.com (COP/USD).

export type Rates = { usdToBs: number; usdToCop: number; updatedAt: string };

const FALLBACK: Rates = { usdToBs: 620, usdToCop: 3400, updatedAt: new Date().toISOString() };
const REFRESH_MS = 6 * 60 * 60 * 1000; // 6 horas

let cached: Rates = { ...FALLBACK };
let manualOverride: Partial<Pick<Rates, "usdToBs" | "usdToCop">> = {};

export function getRates(): Rates {
  return {
    usdToBs: manualOverride.usdToBs ?? cached.usdToBs,
    usdToCop: manualOverride.usdToCop ?? cached.usdToCop,
    updatedAt: cached.updatedAt,
  };
}

/** El admin puede fijar manualmente una tasa. Se limpia con `clearManualRates`. */
export function setManualRates(patch: { usdToBs?: number; usdToCop?: number }) {
  if (patch.usdToBs && patch.usdToBs > 0) manualOverride.usdToBs = patch.usdToBs;
  if (patch.usdToCop && patch.usdToCop > 0) manualOverride.usdToCop = patch.usdToCop;
}

export function clearManualRates() {
  manualOverride = {};
}

async function fetchRates() {
  try {
    const [bcvRes, erRes] = await Promise.all([
      fetch("https://ve.dolarapi.com/v1/dolares/oficial", { signal: AbortSignal.timeout(10000) }),
      fetch("https://open.er-api.com/v6/latest/USD", { signal: AbortSignal.timeout(10000) }),
    ]);

    let newBs = cached.usdToBs;
    let newCop = cached.usdToCop;

    if (bcvRes.ok) {
      const bcv = (await bcvRes.json()) as { promedio?: number };
      if (bcv.promedio && bcv.promedio > 0) newBs = bcv.promedio;
    }

    if (erRes.ok) {
      const er = (await erRes.json()) as { rates?: { COP?: number; VES?: number } };
      if (er.rates?.COP && er.rates.COP > 0) newCop = er.rates.COP;
      // ExchangeRate-API también trae VES, podemos usarlo como fallback del BCV
      if (newBs === cached.usdToBs && er.rates?.VES && er.rates.VES > 0) {
        newBs = er.rates.VES;
      }
    }

    cached = { usdToBs: newBs, usdToCop: newCop, updatedAt: new Date().toISOString() };
    console.log(`💱 Tasas actualizadas: 1 USD = ${newBs} Bs · ${newCop} COP`);
  } catch (err) {
    console.warn("⚠️ No se pudieron actualizar las tasas:", (err as Error).message);
    // Mantiene los valores anteriores
  }
}

let timer: NodeJS.Timeout | null = null;

/** Inicia el servicio de tasas: consulta ahora y programa re-consulta cada 6h. */
export async function initRates() {
  await fetchRates();
  timer = setInterval(fetchRates, REFRESH_MS);
  timer.unref?.(); // no mantener vivo el proceso por este timer
}
