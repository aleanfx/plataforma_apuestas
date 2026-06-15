"use client";

import * as React from "react";

// Posiciones de los puntos (pips) en una rejilla 3x3 por mitad, según el valor.
//   0 1 2
//   3 4 5
//   6 7 8
const PIPS: Record<number, number[]> = {
  0: [],
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

function Half({ value }: { value: number }) {
  const on = new Set(PIPS[value] ?? []);
  return (
    <div className="dom-half">
      {Array.from({ length: 9 }, (_, i) => (
        <span key={i} className={`dom-pip${on.has(i) ? " on" : ""}`} />
      ))}
    </div>
  );
}

/**
 * Ficha de dominó con puntos reales.
 * - orientation "v": vertical (mano, dobles en la mesa).
 * - orientation "h": horizontal (cadena de la mesa).
 */
export function DominoPiece({
  a,
  b,
  orientation = "v",
  legal = false,
  onClick,
  faceDown = false,
}: {
  a: number;
  b: number;
  orientation?: "v" | "h";
  legal?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
}) {
  const cls = `dom-tile ${orientation}${legal ? " legal" : ""}${onClick ? " clickable" : ""}${faceDown ? " down" : ""}`;
  if (faceDown) return <div className={cls} aria-hidden />;
  return (
    <div className={cls} onClick={onClick} role={onClick ? "button" : undefined}>
      <Half value={a} />
      <span className="dom-divider" />
      <Half value={b} />
    </div>
  );
}
