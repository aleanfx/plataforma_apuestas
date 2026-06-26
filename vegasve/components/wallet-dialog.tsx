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
import { CardAccount, Copy } from "@/components/icons";
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
import {
  COINS,
  useCryptoPrices,
  usdToCrypto,
  fmtCrypto,
  type CryptoCoin,
} from "@/lib/crypto";

/** Limpia un número para pegar en el banco: sin espacios ni puntos. */
function cleanForCopy(v: string): string {
  return v.replace(/[\s.]/g, "");
}

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
    ],
    needsProof: false, // se confirma automáticamente con NowPayments (pendiente de API key)
  },
  {
    id: "binance",
    name: "Binance",
    depSub: "Binance Pay",
    wdSub: "Binance Pay",
    ic: "B",
    icStyle: { background: "#0b0e11" },
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
    icStyle: { background: "#fff" },
    details: [{ k: "Daviplata", v: "301 913 7963" }],
    needsProof: true,
  },
  {
    id: "nequi",
    name: "Nequi",
    depSub: "Colombia (COP)",
    wdSub: "Colombia",
    ic: "N",
    icStyle: { background: "#fff", color: "#2d0b4e" },
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

const getMethodIcon = (id: string) => {
  switch (id) {
    case "nowpayments":
      return (
        <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 18, height: 18 }}>
          <path d="M18.7538 10.5176c0 .6251-2.2379 1.1483-5.2381 1.2812l.0028.0007c-.0848.0064-.5233.0325-1.5012.0325-.7778 0-1.33-.0233-1.5237-.0325-3.0059-.1322-5.2495-.6555-5.2495-1.2819s2.2436-1.149 5.2495-1.2834v2.0442c.1965.0142.7594.0474 1.5372.0474.9334 0 1.4008-.0389 1.4849-.0466V9.2356c2.9994.1337 5.2381.657 5.2381 1.282zm5.19.5466L12.1248 22.389a.1803.1803 0 0 1-.2496 0L.0562 11.0635a.1781.1781 0 0 1-.0382-.2079l4.3762-9.1921a.1767.1767 0 0 1 .1626-.1026h14.8878a.1768.1768 0 0 1 .1612.1032l4.3762 9.1922a.1782.1782 0 0 1-.0382.2079zm-4.478-.4038c0-.8068-2.5515-1.4799-5.9473-1.6369V7.195h4.186V4.4055H6.3076V7.195h4.1852v1.8286c-3.4018.1562-5.9601.83-5.9601 1.6376 0 .8075 2.5583 1.4806 5.9601 1.6376v5.8618h3.025v-5.8639c3.394-.1563 5.948-.8295 5.948-1.6363z"/>
        </svg>
      );
    case "binance":
      return (
        // Logo oficial de Binance (badge dorado).
        // eslint-disable-next-line @next/next/no-img-element
        <img src="/coins/bnb.svg" alt="Binance" width={30} height={30} style={{ display: "block" }} />
      );
    case "pagomovil":
      return (
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 18, height: 18 }}>
          <path d="M6 7C4.7 8.5 4 10.4 4 12.5C4 14.6 4.7 16.5 6 18" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" />
          <path d="M18 6C19.3 7.5 20 9.4 20 11.5C20 13.6 19.3 15.5 18 17" stroke="#3b82f6" strokeWidth="2.2" strokeLinecap="round" />
          <rect x="8.5" y="4" width="7" height="16" rx="1.5" stroke="currentColor" strokeWidth="2" fill="none" />
          <circle cx="12" cy="17.5" r="0.75" fill="currentColor" />
          <line x1="10.5" y1="6" x2="13.5" y2="6" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case "daviplata":
      return (
        <svg viewBox="5.88 9.87 291 157.1" fill="currentColor" xmlns="http://www.w3.org/2000/svg" style={{ width: 30, height: 16 }}>
          <path d="m153.43 60.84c.42-3.45 1.29-6.41 2.48-9.25 2.61-6.21 5.48-12.32 8.04-18.56 3.42-8.35 9.89-11.83 18.52-12.17 6.29-.25 12.44.37 18.34 2.7.79.31 1.26.38 1.66-.55.42-.96 1.09-1.81 1.62-2.73.87-1.54 1-3.06.08-4.7-1.14-2.05-.68-3.81 1.09-4.77 1.74-.94 4.01-.42 4.93 1.14 1.03 1.76.57 3.8-1.3 4.96-.93.58-1.46 1.26-1.55 2.33-.03.39-.12.8-.27 1.16-1.35 3.25-1.68 6.2-.08 9.77 1.89 4.22.64 8.89-.66 13.24-5.51 18.45-14.87 34.74-27.79 48.99-2.55 2.81-5.58 4.92-9.58 5.04-.79.03-1.14.6-1.58 1.06-5.6 5.88-11.84 10.78-19.79 13.15-4.89 1.46-9.92 1.65-14.96 1.69-2.74.02-5.04-1.05-6.79-3.18-6.47-7.86-11.01-16.64-12.7-26.77-.19-1.14-.57-2.29-.28-3.69 3.74 3.02 7.53 5.76 11.8 7.74 5.6 2.61 11.36 4.18 17.5 2.19 2.51-.81 5.07-1.75 6.17-4.55.34-.87.78-.43 1.18-.14 1.72 1.24 3.42 2.51 5.13 3.77 2.35 1.74 4.79 3.3 7.56 4.34 4.67 1.76 8.72.75 12.2-2.7 4.36-4.32 7.71-9.44 10.99-14.58 6.57-10.3 11.83-21.26 15.92-32.77.94-2.64 1.28-5.4 1.24-8.21-.06-3.49-1.72-5.88-4.86-7.3-4.59-2.08-9.45-2.44-14.39-2.17-1.06.06-2.11.21-3.16.34-6.14.72-10.51 3.8-13.28 9.42-3.31 6.71-6.23 13.58-9.38 20.35-.93 1.99-1.97 3.87-4.05 5.41zm-11.73 33.67c-.27-.02-.53-.08-.78-.05-1.08.15-2.3 1.4-3.13-.49-.07-.15-1.51.03-1.22 1.01.33 1.13-.1 1.72-.93 2.32-1.12.81-1.64 1.89-1.08 3.28.54 1.36 1.75 1.25 2.86 1.21 1.65-.05 3.29-.24 4.94-.26.74-.01 1.72-.06 1.89 1 .14.92-.32 1.67-1.08 2.2-.95.66-2.09.78-3.17 1.07-.64.17-1.65.06-1.33 1.19.33 1.15 1.14.4 1.74.28 1.37-.26 2.78-1.51 4.01.37.22.34.87-.1 1.22-.37.48-.36.14-.69-.18-.94-1.11-.88-.51-1.62.23-2.27.96-.84 1.3-1.83.81-3.01-.54-1.31-1.65-1.58-2.94-1.5-1.71.1-3.43.23-5.14.19-.61-.01-1.63.18-1.72-.88-.06-.78.38-1.41 1.11-1.73.66-.29 1.37-.48 2.04-.75.84-.34 1.76-.64 1.85-1.87zm-130.35 60.54c0-2.12-.02-4.24.01-6.37.02-1.45.18-2.93 2.13-2.94s2.13 1.41 2.13 2.91c0 3.85.03 7.69-.02 11.54-.01 1.04.25 1.52 1.36 1.67 4.76.64 9.39.38 13.77-1.76 5.01-2.45 8.06-9.62 1.67-14.83-3.6-2.94-7.85-3.66-12.24-4.01-3.66-.29-7.27.11-10.8 1.11-1.24.35-2.47.55-2.99-.95-.49-1.44.34-2.45 1.62-2.98 2.8-1.17 5.78-1.37 8.77-1.44 5.42-.13 10.73.51 15.7 2.8 4.51 2.08 7.79 5.27 8.62 10.4.91 5.66-2.36 11.32-8.11 13.88-5.82 2.6-11.93 2.89-18.12 1.84-2.46-.42-3.31-1.59-3.49-4.11-.01-.13-.01-.27-.01-.4v-6.36zm50.69-18.06c1.96-.01 3.44 1 4.82 2.16 2.77 2.33 4.82 5.26 6.75 8.28 2.78 4.36 5.11 8.94 7.14 13.69.26.6.47 1.24.58 1.88.26 1.55-.25 2.8-1.81 3.31-1.65.54-2.43-.57-2.97-1.89-2.39-5.82-5.15-11.45-8.68-16.68-1.11-1.65-2.33-3.21-3.95-4.42-1.22-.91-2.39-.94-3.64-.05-1.71 1.21-2.95 2.85-4.1 4.55-3.44 5.05-6.13 10.49-8.47 16.11-.6 1.45-1.19 2.97-3.24 2.36-1.61-.48-2.29-2.34-1.48-4.31 3.04-7.36 6.66-14.41 11.87-20.52 1.9-2.22 4.02-4.22 7.18-4.47z" fill="#e01a19"/>
          <path d="m236.69 162.37c.06 1.82-.51 2.97-2.05 3.29-1.56.32-2.25-.76-2.77-2-2.55-6.12-5.41-12.09-9.29-17.51-.27-.38-.55-.75-.85-1.1-3.53-4.19-5.37-4.2-8.73.09-4.23 5.43-7.17 11.58-9.87 17.86-.18.43-.33.87-.54 1.28-.5.95-1.22 1.59-2.38 1.42-1.1-.16-1.77-.88-2.1-1.88-.25-.77-.23-1.57.09-2.34 3.2-7.6 6.9-14.91 12.36-21.2.13-.15.26-.3.4-.44 4.57-4.76 8.09-4.86 12.65-.06 5.89 6.21 9.54 13.8 12.86 21.56.18.4.19.89.22 1.03zm21.42-.23c.01-.04.08-.65.31-1.18 2.86-6.8 6.25-13.31 10.83-19.14 1.27-1.62 2.68-3.13 4.41-4.28 2.69-1.79 4.9-1.75 7.56.08 2.22 1.53 3.92 3.57 5.48 5.72 3.9 5.4 6.95 11.27 9.55 17.38.23.54.44 1.13.49 1.7.14 1.56-.43 2.8-2.02 3.21-1.54.39-2.28-.64-2.81-1.91-2.14-5.22-4.62-10.27-7.59-15.06-1.19-1.92-2.48-3.77-4.14-5.32-2.07-1.93-3.41-1.98-5.49-.03-2.59 2.44-4.36 5.49-6.11 8.54-2.21 3.86-4.11 7.86-5.79 11.98-.49 1.19-1.25 2.14-2.69 1.82-1.51-.33-2.13-1.44-1.99-3.51z" fill="#8c8a8e"/>
          <path d="m96.41 166.45c-1.62-.04-2.9-.83-4.08-1.85-2.19-1.88-3.85-4.2-5.38-6.61-3.19-5.05-5.75-10.42-7.93-15.97-.36-.93-.74-1.88-.44-2.9.32-1.06.88-1.95 2.13-2.08 1.22-.12 1.79.66 2.17 1.66 1.33 3.53 2.81 7 4.5 10.37 1.68 3.38 3.41 6.74 5.88 9.64 2.37 2.78 3.94 2.84 6.27.06 3.75-4.47 6.09-9.75 8.44-15.01.75-1.69 1.37-3.44 2.09-5.15.41-.97 1.03-1.76 2.24-1.56 1.2.19 1.81 1.02 2.03 2.15.14.72.09 1.45-.18 2.15-2.8 7.17-6.06 14.11-10.76 20.28-1.01 1.32-2.15 2.53-3.5 3.52-1.03.78-2.15 1.33-3.48 1.3z" fill="#e01a19"/>
          <path d="m141.71 140.39c-3.67.13-6.88.42-10.05 1.28-1.4.38-3.35.9-3.84-1.17-.44-1.87 1.33-2.36 2.76-2.71 9-2.23 17.84-2.23 26.39 1.9 1.21.58 2.29 1.35 3.24 2.28 2.45 2.39 2.39 5.27-.11 7.64-1.44 1.37-3.25 2.03-5.1 2.56-3.61 1.03-7.3 1.28-11.03 1.16-1.15-.04-2.18-.4-2.17-1.78.01-1.41 1.06-1.68 2.21-1.7 2.85-.05 5.7-.2 8.5-.81.58-.13 1.16-.29 1.71-.52 1.26-.53 2.38-1.22 2.46-2.81s-1.11-2.19-2.23-2.73c-4.16-2.05-8.62-2.56-12.74-2.59zm30.65 5.85c0 1.86.03 3.71-.01 5.57-.08 4.09 1.81 6.93 5.63 8.43 4.08 1.6 8.3 1.5 12.54.96 1.53-.19 2.99-.22 3.24 1.6.24 1.78-1.12 2.31-2.65 2.51-3.83.51-7.65.58-11.48 0-7.72-1.18-12.29-6.16-12.57-13.99-.14-3.9-.05-7.82-.01-11.73.02-2.06 1.09-3.26 2.72-3.24 1.62.02 2.57 1.2 2.6 3.33.02 2.19 0 4.38-.01 6.56zm78.27 6.13c0 3.45.02 6.9-.01 10.34-.01 2.06-.79 3.05-2.36 2.98-1.87-.09-2.47-1.36-2.47-2.98-.02-6.83-.07-13.66.03-20.49.02-1.61-.47-2.05-2.01-1.96-2.12.12-4.24.05-6.37 0-1.26-.03-2.58-.38-2.68-1.82-.1-1.39 1.21-1.75 2.34-1.98.64-.13 1.31-.16 1.97-.16 6.17-.01 12.34-.01 18.51 0 .6 0 1.21-.02 1.78.11 1.1.25 2.4.5 2.29 1.99-.1 1.36-1.25 1.81-2.45 1.85-1.99.08-3.98.05-5.97.05-2.62.01-2.62 0-2.62 2.53.02 3.18.02 6.36.02 9.54z" fill="#8c8a8e"/>
          <path d="m124.36 151.99c0 3.77.02 7.54-.01 11.31-.01 2.17-.83 3.19-2.42 3.14-1.55-.05-2.42-1.16-2.42-3.23-.01-7.61-.01-15.22 0-22.83 0-2.09.86-3.23 2.38-3.27 1.57-.05 2.46 1.12 2.47 3.36.02 3.84 0 7.68 0 11.52zm54.76-100.86c1.91.17 3.82.3 5.73.53.46.06 1.15.07 1.22.79.07.64-.25 1.15-.74 1.54-1 .81-2.26.89-3.41.83-3.77-.18-7.54-.45-11.17-1.62-3.77-1.21-4.96-3.1-4.14-6.91 1.07-4.99 4.15-8.95 7.05-12.97.5-.7 1.17-.46 1.78-.12.74.41.67.98.37 1.69-1.09 2.65-2.9 4.89-4.26 7.38-.73 1.33-1.55 2.62-1.96 4.1-.6 2.19.09 3.6 2.24 4.32 2.37.79 4.84.57 7.29.44z" fill="#e01a19"/>
          <path d="m139.38 155.61c0 2.52-.02 5.04.01 7.56.01 1.62-.72 2.51-2.36 2.53-1.67.03-2.65-.72-2.65-2.48 0-5.11.02-10.21-.01-15.32-.01-1.73.85-2.69 2.48-2.69 1.61 0 2.57.89 2.55 2.64-.04 2.58-.02 5.17-.02 7.76z" fill="#8c8a8e"/>
          <path d="m141.7 94.51c-.08 1.22-1 1.53-1.85 1.88-.67.27-1.38.46-2.04.75-.72.32-1.17.95-1.11 1.73.09 1.07 1.11.87 1.72.88 1.71.04 3.43-.09 5.14-.19 1.29-.07 2.4.19 2.94 1.5.48 1.18.15 2.17-.81 3.01-.74.65-1.34 1.39-.23 2.27.32.25.65.58.18.94-.35.26-1 .7-1.22.37-1.23-1.88-2.64-.63-4.01-.37-.6.12-1.41.87-1.74-.28-.32-1.13.69-1.02 1.33-1.19 1.08-.29 2.22-.41 3.17-1.07.76-.53 1.23-1.27 1.08-2.2-.17-1.06-1.15-1.01-1.89-1-1.65.01-3.29.21-4.94.26-1.11.03-2.32.14-2.86-1.21-.56-1.39-.04-2.47 1.08-3.28.83-.6 1.26-1.19.93-2.32-.28-.98 1.16-1.16 1.22-1.01.84 1.88 2.06.63 3.13.49.25-.04.5.02.78.04z" fill="#fff"/>
        </svg>
      );
    case "nequi":
      return (
        <svg viewBox="0 0 35 28" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ width: 22, height: 18 }}>
          <path d="M5.29905 0.283325H0.918073C0.411035 0.283325 0 0.694772 0 1.20232V4.92665C0 5.4342 0.411035 5.84564 0.918073 5.84564H5.29905C5.80609 5.84564 6.21713 5.4342 6.21713 4.92665V1.20232C6.21713 0.694772 5.80609 0.283325 5.29905 0.283325Z" fill="#DA0081"/>
          <path d="M31.9884 0.283325H28.2195C27.7041 0.283325 27.3014 0.702514 27.3014 1.20232V16.277C27.3014 16.5833 26.8987 16.6962 26.7538 16.4221L17.9918 0.686392C17.8469 0.428429 17.5892 0.283325 17.2831 0.283325H11.0177C10.5023 0.283325 10.0996 0.702514 10.0996 1.20232V25.2896C10.0996 25.8055 10.5184 26.2086 11.0177 26.2086H14.7866C15.302 26.2086 15.7047 25.7894 15.7047 25.2896V9.76345C15.7047 9.45712 16.1074 9.34426 16.2523 9.61834L25.2559 25.8216C25.4008 26.0796 25.6585 26.2247 25.9646 26.2247H31.9562C32.4716 26.2247 32.8743 25.8055 32.8743 25.3057V1.20232C32.8743 0.686392 32.4555 0.283325 31.9562 0.283325H31.9884Z" fill="currentColor"/>
        </svg>
      );
    default:
      return null;
  }
};

// Glifo de marca para el disco del logo (la sigla va al lado en texto).
const COIN_GLYPH: Record<string, string> = {
  BTC: "₿",
  ETH: "Ξ",
  USDT: "₮",
  USDC: "$",
  LTC: "Ł",
  BNB: "B",
  TRX: "T",
  SOL: "S",
};

function CoinLogo({ coin, size = 26 }: { coin: CryptoCoin; size?: number }) {
  const [failed, setFailed] = React.useState(false);
  if (failed) {
    // Respaldo: disco de color con el glifo si el SVG no cargara.
    return (
      <span
        className="coin-logo"
        style={{ background: coin.color, width: size, height: size, fontSize: Math.round(size * 0.5) }}
      >
        {COIN_GLYPH[coin.symbol] ?? coin.symbol[0]}
      </span>
    );
  }
  return (
    // Logo oficial de la marca (badge SVG a color en /public/coins).
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`/coins/${coin.symbol.toLowerCase()}.svg`}
      alt={coin.symbol}
      width={size}
      height={size}
      className="coin-logo-img"
      onError={() => setFailed(true)}
    />
  );
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
  const [coinId, setCoinId] = React.useState<string>("");
  const [coinPickOpen, setCoinPickOpen] = React.useState(false);
  const fileRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!open) {
      setMethod("nowpayments");
      setAmount("");
      setDest("");
      setBusy(false);
      setProofUrl(null);
      setProofName("");
      setCoinId("");
      setCoinPickOpen(false);
    }
  }, [open]);

  const isDep = kind === "deposit";
  const active = METHODS.find((m) => m.id === method)!;
  const isCrypto = isDep && method === "nowpayments";

  // Precios en vivo de las criptos (solo cuando el flujo cripto está activo).
  const { prices, error: priceError } = useCryptoPrices(open && isCrypto);
  const coin: CryptoCoin | null = COINS.find((c) => c.id === coinId) ?? null;

  // Moneda del monto según el método de pago
  const inputCurrency: CurrencyCode = isDep ? methodCurrency(method) : currency;
  const sym = currencySymbol(inputCurrency);

  const value = typeof amount === "number" ? amount : 0;
  // Convertir monto local a céntimos internos
  const cents = localToCents(value, inputCurrency, rates);
  // Texto de equivalencia en las otras monedas
  const equivText = cents > 0 ? formatEquivalents(cents, inputCurrency, rates) : "";

  // Conversión a cripto (para NowPayments). El monto del input es en USD.
  const coinPrice = coin && prices ? prices[coin.id] : 0;
  const cryptoAmount = isCrypto && coin ? usdToCrypto(value, coinPrice) : 0;

  const getDepSub = (methodId: string) => {
    if (methodId === "pagomovil") {
      return `Mín. Bs. ${rates.minDepBs.toLocaleString("es-VE")}`;
    }
    const usdMin = rates.minDepUsd;
    let prefix = "";
    if (methodId === "nowpayments") prefix = "NowPayments · ";
    if (methodId === "binance") prefix = "Binance Pay · ";
    return `${prefix}Mín. $${usdMin}`;
  };

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
    if (isDep) {
      if (method === "pagomovil") {
        if (value < rates.minDepBs) {
          toast.error(
            `El monto mínimo de depósito por Pago Móvil es Bs. ${rates.minDepBs.toLocaleString("es-VE")}. Si deseas depositar menos, por favor escribe a soporte al correo ${rates.adminEmail || "betmarplay@gmail.com"}.`,
            { duration: 8000 }
          );
          return;
        }
      } else {
        const usdMin = rates.minDepUsd;
        const amountInUsd = cents / 100 / rates.usdToBs;
        if (amountInUsd < usdMin) {
          toast.error(
            `El monto mínimo de depósito para este método es $${usdMin} USD (o su equivalente). Si deseas depositar menos, por favor escribe a soporte al correo ${rates.adminEmail || "betmarplay@gmail.com"}.`,
            { duration: 8000 }
          );
          return;
        }
      }
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
    // Cripto: hay que elegir la moneda con la que se pagará
    if (isCrypto && !coin) {
      toast.error("Elige la criptomoneda con la que pagarás.");
      return;
    }

    setBusy(true);
    try {
      if (isDep) {
        const cryptoNote = isCrypto && coin && cryptoAmount > 0
          ? ` ≈ ${fmtCrypto(cryptoAmount)} ${coin.symbol}`
          : "";
        const reference =
          isCrypto && coin
            ? `Cripto ${coin.symbol} · $${value}${cryptoNote}`
            : `${sym} ${value}`;
        await api("/wallet/deposit", {
          method: "POST",
          body: {
            method,
            amount: cents,
            reference,
            proofUrl: proofUrl ?? undefined,
          },
        });
        setOpen(false);
        toast.success(
          isCrypto && coin
            ? cryptoAmount > 0
              ? `Orden cripto registrada — paga ${fmtCrypto(cryptoAmount)} ${coin.symbol} y se acreditará al confirmarse.`
              : `Orden cripto registrada en ${coin.symbol} — te confirmaremos el monto exacto a pagar.`
            : "Depósito en revisión — se acreditará al confirmar tu pago.",
        );
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
                  {getMethodIcon(m.id)}
                </div>
                <div>
                  <div className="m-name">{m.name}</div>
                  <div className="m-sub">{isDep ? getDepSub(m.id) : m.wdSub}</div>
                </div>
              </button>
            ))}
          </div>

          {isDep ? (
            isCrypto ? (
              <div className="crypto-pick">
                <div className="crypto-pick-head">
                  <span>Pagas con la cripto que prefieras</span>
                  <button
                    type="button"
                    className="crypto-toggle"
                    onClick={() => setCoinPickOpen((o) => !o)}
                  >
                    {coin ? "Cambiar" : "Elegir cripto"}
                  </button>
                </div>

                {coin && !coinPickOpen && (
                  <button
                    type="button"
                    className="crypto-current"
                    onClick={() => setCoinPickOpen(true)}
                  >
                    <CoinLogo coin={coin} />
                    <span className="cc-sym">{coin.symbol}</span>
                    <span className="cc-name">
                      {coin.name}
                      {coin.net ? ` · ${coin.net}` : ""}
                    </span>
                    <span className="cc-chev">▾</span>
                  </button>
                )}

                {(coinPickOpen || !coin) && (
                  <div className="crypto-grid">
                    {COINS.map((c) => {
                      const p = prices?.[c.id] ?? 0;
                      return (
                        <button
                          key={c.id}
                          type="button"
                          className={`crypto-opt${coinId === c.id ? " active" : ""}`}
                          onClick={() => {
                            setCoinId(c.id);
                            setCoinPickOpen(false);
                          }}
                        >
                          <CoinLogo coin={c} />
                          <span className="cc-sym">{c.symbol}</span>
                          {value > 0 && p > 0 ? (
                            <span className="cc-amt">≈ {fmtCrypto(usdToCrypto(value, p))}</span>
                          ) : (
                            <span className="cc-amt dim">{c.net}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                )}

                <div className="crypto-hint">
                  Elige entre USDT, BTC, ETH y más. El monto que ingreses abajo se
                  convierte <strong>en vivo</strong> a la cripto seleccionada.
                </div>
              </div>
            ) : (
            <div className="pay-details">
              <div className="pay-details-head">
                Envía tu pago a <span className="gold">{active.name}</span>
              </div>
              {active.details.map((d) => {
                const canCopy = !["Banco", "Red", "Acepta", "Mínimo"].includes(d.k);
                return (
                  <div className="pay-row" key={d.k}>
                    <span className="pay-k">{d.k}</span>
                    <span className="pay-v" style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      {d.v}
                      {canCopy && (
                        <button
                          type="button"
                          className="copy-btn-small"
                          title={`Copiar ${d.k}`}
                          onClick={() => {
                            // Sin espacios ni puntos: listo para pegar en el banco.
                            const clean = cleanForCopy(d.v);
                            navigator.clipboard.writeText(clean);
                            toast.success(`${d.k} copiado: ${clean}`);
                          }}
                          style={{
                            background: "none",
                            border: "none",
                            padding: "4px",
                            cursor: "pointer",
                            color: "var(--text-3)",
                            display: "inline-flex",
                            alignItems: "center",
                            borderRadius: "4px",
                            transition: "all 0.2s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--gold)")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-3)")}
                        >
                          <Copy style={{ width: "13px", height: "13px" }} />
                        </button>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
            )
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

          {/* Conversión a cripto en vivo (NowPayments) o equivalencia de monedas */}
          {isCrypto ? (
            <div className="crypto-convert">
              {priceError ? (
                <span className="cc-err">No se pudieron cargar las tasas en vivo. Intenta de nuevo.</span>
              ) : !coin ? (
                <span className="cc-muted">Elige una criptomoneda arriba para ver la conversión.</span>
              ) : value <= 0 ? (
                <span className="cc-muted">Ingresa un monto para ver cuánto pagarás en {coin.symbol}.</span>
              ) : !prices ? (
                <span className="cc-muted">Calculando tasa de {coin.symbol}…</span>
              ) : coinPrice <= 0 ? (
                <span className="cc-err">Tasa de {coin.symbol} no disponible ahora.</span>
              ) : (
                <>
                  <div className="cc-pay">
                    Pagarás aprox. <strong>{fmtCrypto(cryptoAmount)} {coin.symbol}</strong>
                  </div>
                  <div className="cc-rate">
                    1 {coin.symbol} ≈ ${coinPrice.toLocaleString("en-US", { maximumFractionDigits: 2 })} · tasa en vivo
                  </div>
                </>
              )}
            </div>
          ) : (
            equivText && <div className="equiv-line">≈ {equivText}</div>
          )}

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
            disabled={busy || (isCrypto && !coin)}
          >
            {busy
              ? "Procesando…"
              : isDep
                ? isCrypto
                  ? coin
                    ? `Pagar con ${coin.symbol}`
                    : "Elige una cripto"
                  : "Confirmar depósito"
                : "Solicitar retiro"}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
