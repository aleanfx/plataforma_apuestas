// Helpers de formato de dinero. El backend envía montos en CÉNTIMOS (unidades internas).
// Internamente la plataforma opera en céntimos de Bs; aquí se convierte para mostrar.

export type CurrencyCode = "VES" | "USD" | "COP";
export type Rates = { usdToBs: number; usdToCop: number };

// Tasas por defecto (fallback mientras carga del backend)
export const DEFAULT_RATES: Rates = { usdToBs: 620, usdToCop: 3400 };

/** Céntimos internos → Bs (divide por 100). */
function centsToVes(cents: number): number {
  return cents / 100;
}

/** Céntimos internos → USD (Bs / tasa). */
function centsToUsd(cents: number, rates: Rates): number {
  return centsToVes(cents) / rates.usdToBs;
}

/** Céntimos internos → COP (USD * tasa COP). */
function centsToCop(cents: number, rates: Rates): number {
  return centsToUsd(cents, rates) * rates.usdToCop;
}

/** Formatea un número como Bs: "Bs. 12.480" (sin decimales, separador de miles es-VE). */
export function formatBs(cents: number): string {
  const bs = centsToVes(cents);
  return "Bs. " + bs.toLocaleString("es-VE", { maximumFractionDigits: 0 });
}

/** Formatea como USD: "$12,50" (2 decimales). */
export function formatUsd(cents: number, rates: Rates = DEFAULT_RATES): string {
  const usd = centsToUsd(cents, rates);
  return "$" + usd.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Formatea como USD corto: "$312" (sin decimales). */
export function formatUsdShort(cents: number, rates: Rates = DEFAULT_RATES): string {
  const usd = Math.round(centsToUsd(cents, rates));
  return "$" + usd.toLocaleString("es-VE");
}

/** Formatea como COP: "COP 43.000" (sin decimales). */
export function formatCop(cents: number, rates: Rates = DEFAULT_RATES): string {
  const cop = centsToCop(cents, rates);
  return "COP " + Math.round(cop).toLocaleString("es-VE", { maximumFractionDigits: 0 });
}

/** Formatea según la moneda seleccionada por el usuario. */
export function formatMoney(cents: number, currency: CurrencyCode, rates: Rates = DEFAULT_RATES): string {
  switch (currency) {
    case "VES": return formatBs(cents);
    case "USD": return formatUsd(cents, rates);
    case "COP": return formatCop(cents, rates);
  }
}

/** Formatea corto (para badges, chips). */
export function formatMoneyShort(cents: number, currency: CurrencyCode, rates: Rates = DEFAULT_RATES): string {
  switch (currency) {
    case "VES": return formatBs(cents);
    case "USD": return formatUsdShort(cents, rates);
    case "COP": return formatCop(cents, rates);
  }
}

/** Muestra equivalencia en las OTRAS dos monedas (para mostrar abajo del monto). */
export function formatEquivalents(cents: number, activeCurrency: CurrencyCode, rates: Rates = DEFAULT_RATES): string {
  const all: [CurrencyCode, string][] = [
    ["VES", formatBs(cents)],
    ["USD", formatUsd(cents, rates)],
    ["COP", formatCop(cents, rates)],
  ];
  return all.filter(([c]) => c !== activeCurrency).map(([, v]) => v).join(" · ");
}

/** Convierte un monto en moneda local a céntimos internos (Bs céntimos). */
export function localToCents(amount: number, currency: CurrencyCode, rates: Rates): number {
  switch (currency) {
    case "VES": return Math.round(amount * 100);
    case "USD": return Math.round(amount * rates.usdToBs * 100);
    case "COP": return Math.round((amount / rates.usdToCop) * rates.usdToBs * 100);
  }
}

/** Símbolo de moneda para mostrar en inputs. */
export function currencySymbol(currency: CurrencyCode): string {
  switch (currency) {
    case "VES": return "Bs.";
    case "USD": return "$";
    case "COP": return "COP";
  }
}

/** Moneda natural de cada método de pago. */
export function methodCurrency(methodId: string): CurrencyCode {
  switch (methodId) {
    case "pagomovil": return "VES";
    case "daviplata":
    case "nequi": return "COP";
    default: return "USD"; // nowpayments, binance
  }
}

/** Inicial para el avatar a partir del nombre. */
export function initialOf(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}
