// Helpers de formato de dinero. El backend envía montos en CÉNTIMOS de Bs.
// Aquí solo se formatea para mostrar (la autoridad del dinero es el servidor).

export const BS_PER_USD = 40; // tasa demo; coincide con la UI existente

/** Céntimos -> "Bs. 12.480" (sin decimales, separador de miles es-VE). */
export function formatBs(cents: number): string {
  const bs = cents / 100;
  return "Bs. " + bs.toLocaleString("es-VE", { maximumFractionDigits: 0 });
}

/** Céntimos -> "$312,00" (equivalente en USD a la tasa demo). */
export function formatUsd(cents: number): string {
  const usd = cents / 100 / BS_PER_USD;
  return "$" + usd.toLocaleString("es-VE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Céntimos -> "$312" (compacto, sin decimales). */
export function formatUsdShort(cents: number): string {
  const usd = Math.round(cents / 100 / BS_PER_USD);
  return "$" + usd.toLocaleString("es-VE");
}

/** Inicial para el avatar a partir del nombre. */
export function initialOf(name: string): string {
  return (name.trim()[0] ?? "?").toUpperCase();
}
