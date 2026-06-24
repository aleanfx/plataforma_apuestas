// Servicio de tasas de cambio y configuraciones del sistema.
// Cachea en memoria, persiste en base de datos (SystemSetting) y re-consulta tasas de cambio cada 6 horas.
// Fuentes: dolarapi.com (BCV oficial para Bs/USD) + open.er-api.com (COP/USD).

import { prisma } from "../db.js";
import { env } from "../env.js";

export type Rates = {
  usdToBs: number;
  usdToCop: number;
  minDepUsd: number;
  minDepBs: number;
  updatedAt: string;
  adminEmail: string;
};

const FALLBACK: Omit<Rates, "adminEmail"> = {
  usdToBs: 620,
  usdToCop: 3400,
  minDepUsd: 1.0,
  minDepBs: 500.0,
  updatedAt: new Date().toISOString(),
};
const REFRESH_MS = 6 * 60 * 60 * 1000; // 6 horas

let cached = { ...FALLBACK };
let manualOverride: { usdToBs?: number; usdToCop?: number } = {};
let minDepUsd = FALLBACK.minDepUsd;
let minDepBs = FALLBACK.minDepBs;

export function getRates(): Rates {
  return {
    usdToBs: manualOverride.usdToBs ?? cached.usdToBs,
    usdToCop: manualOverride.usdToCop ?? cached.usdToCop,
    minDepUsd,
    minDepBs,
    updatedAt: cached.updatedAt,
    adminEmail: env.ADMIN_EMAIL,
  };
}

async function saveDbSetting(key: string, value: string) {
  try {
    await prisma.systemSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });
  } catch (err) {
    console.warn(`⚠️ No se pudo guardar la configuración ${key}:`, (err as Error).message);
  }
}

export async function updateSystemSettings(patch: {
  usdToBs?: number;
  usdToCop?: number;
  minDepUsd?: number;
  minDepBs?: number;
}) {
  if (patch.usdToBs !== undefined) {
    if (patch.usdToBs > 0) {
      manualOverride.usdToBs = patch.usdToBs;
      await saveDbSetting("usd_to_bs", patch.usdToBs.toString());
    } else if (patch.usdToBs === 0) {
      delete manualOverride.usdToBs;
      await prisma.systemSetting.delete({ where: { key: "usd_to_bs" } }).catch(() => {});
    }
  }

  if (patch.usdToCop !== undefined) {
    if (patch.usdToCop > 0) {
      manualOverride.usdToCop = patch.usdToCop;
      await saveDbSetting("usd_to_cop", patch.usdToCop.toString());
    } else if (patch.usdToCop === 0) {
      delete manualOverride.usdToCop;
      await prisma.systemSetting.delete({ where: { key: "usd_to_cop" } }).catch(() => {});
    }
  }

  if (patch.minDepUsd !== undefined && patch.minDepUsd >= 0) {
    minDepUsd = patch.minDepUsd;
    await saveDbSetting("min_dep_usd", patch.minDepUsd.toString());
  }

  if (patch.minDepBs !== undefined && patch.minDepBs >= 0) {
    minDepBs = patch.minDepBs;
    await saveDbSetting("min_dep_bs", patch.minDepBs.toString());
  }
}

/** Para compatibilidad con rutas existentes */
export async function setManualRates(patch: {
  usdToBs?: number;
  usdToCop?: number;
  minDepUsd?: number;
  minDepBs?: number;
}) {
  await updateSystemSettings(patch);
}

export function clearManualRates() {
  manualOverride = {};
  prisma.systemSetting.deleteMany({
    where: {
      key: { in: ["usd_to_bs", "usd_to_cop"] }
    }
  }).catch(() => {});
}

async function loadDbSettings() {
  try {
    const settings = await prisma.systemSetting.findMany();
    for (const s of settings) {
      if (s.key === "usd_to_bs") {
        const val = parseFloat(s.value);
        if (val > 0) manualOverride.usdToBs = val;
      }
      if (s.key === "usd_to_cop") {
        const val = parseFloat(s.value);
        if (val > 0) manualOverride.usdToCop = val;
      }
      if (s.key === "min_dep_usd") {
        const val = parseFloat(s.value);
        if (val >= 0) minDepUsd = val;
      }
      if (s.key === "min_dep_bs") {
        const val = parseFloat(s.value);
        if (val >= 0) minDepBs = val;
      }
    }
    console.log("⚙️ Configuraciones del sistema cargadas desde DB.");
  } catch (err) {
    console.warn("⚠️ No se pudieron cargar las configuraciones de la base de datos:", (err as Error).message);
  }
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
      if (newBs === cached.usdToBs && er.rates?.VES && er.rates.VES > 0) {
        newBs = er.rates.VES;
      }
    }

    cached = {
      ...cached,
      usdToBs: newBs,
      usdToCop: newCop,
      updatedAt: new Date().toISOString()
    };
    console.log(`💱 Tasas de cambio actualizadas en caché: 1 USD = ${newBs} Bs · ${newCop} COP`);
  } catch (err) {
    console.warn("⚠️ No se pudieron actualizar las tasas de cambio desde las APIs:", (err as Error).message);
  }
}

let timer: NodeJS.Timeout | null = null;

/** Inicia el servicio de tasas: carga la persistencia, consulta APIs y programa timer. */
export async function initRates() {
  await loadDbSettings();
  await fetchRates();
  timer = setInterval(fetchRates, REFRESH_MS);
  timer.unref?.();
}
