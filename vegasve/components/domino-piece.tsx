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

// Centro de cada celda 3x3 dentro de un viewBox 0..100.
const COORDS: [number, number][] = [
  [27, 27], [50, 27], [73, 27],
  [27, 50], [50, 50], [73, 50],
  [27, 73], [50, 73], [73, 73],
];

/**
 * Una mitad de la ficha como SVG: los puntos son <circle> reales (círculos
 * matemáticamente perfectos y nítidos a cualquier tamaño, no se deforman).
 */
function Half({ value, gid }: { value: number; gid: string }) {
  const on = PIPS[value] ?? [];
  return (
    <svg className="dom-half" viewBox="0 0 100 100" aria-hidden focusable="false">
      {on.map((i) => {
        const [cx, cy] = COORDS[i];
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={11.5}
            fill={`url(#${gid})`}
            stroke="#120a30"
            strokeWidth={0.8}
            strokeOpacity={0.55}
          />
        );
      })}
    </svg>
  );
}

/**
 * Ficha de dominó con puntos reales (SVG).
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
  const gid = "dpip-" + React.useId().replace(/[:]/g, "");
  const cls = `dom-tile ${orientation}${legal ? " legal" : ""}${onClick ? " clickable" : ""}${faceDown ? " down" : ""}`;
  if (faceDown) return <div className={cls} aria-hidden />;
  return (
    <div className={cls} onClick={onClick} role={onClick ? "button" : undefined}>
      {/* Definición del degradado del punto (grabado), compartida por ambas mitades */}
      <svg width="0" height="0" style={{ position: "absolute" }} aria-hidden focusable="false">
        <defs>
          <radialGradient id={gid} cx="38%" cy="32%" r="75%">
            <stop offset="0%" stopColor="#7a69b5" />
            <stop offset="50%" stopColor="#33246a" />
            <stop offset="100%" stopColor="#150c3a" />
          </radialGradient>
        </defs>
      </svg>
      <Half value={a} gid={gid} />
      <span className="dom-divider" />
      <Half value={b} gid={gid} />
    </div>
  );
}
