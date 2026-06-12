import crypto from "node:crypto";

// Bingo de 75 bolas. Cartón 5x5 con columnas B-I-N-G-O:
//   col 0 (B): 1-15, col 1 (I): 16-30, col 2 (N): 31-45, col 3 (G): 46-60, col 4 (O): 61-75
// El centro (fila 2, col 2) es ESPACIO LIBRE (valor 0, siempre marcado).

export type Carton = {
  id: string;
  grid: number[][]; // [fila][col], 0 = libre
};

export const FREE = 0;
export const MAX_BALL = 75;

function pickDistinct(min: number, count: number): number[] {
  // count números distintos del rango [min, min+14].
  const pool = Array.from({ length: 15 }, (_, i) => min + i);
  for (let i = pool.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

/** Genera un cartón válido de bingo (75 bolas). */
export function genCarton(): Carton {
  const grid: number[][] = [[], [], [], [], []];
  for (let col = 0; col < 5; col++) {
    const nums = pickDistinct(col * 15 + 1, 5);
    for (let row = 0; row < 5; row++) {
      grid[row][col] = nums[row];
    }
  }
  grid[2][2] = FREE; // espacio libre
  return { id: crypto.randomUUID(), grid };
}

function isMarked(value: number, called: Set<number>): boolean {
  return value === FREE || called.has(value);
}

/** ¿El cartón tiene una línea completa (fila, columna o diagonal)? */
export function hasLine(carton: Carton, called: Set<number>): boolean {
  const g = carton.grid;
  // Filas
  for (let r = 0; r < 5; r++) {
    if (g[r].every((v) => isMarked(v, called))) return true;
  }
  // Columnas
  for (let c = 0; c < 5; c++) {
    if ([0, 1, 2, 3, 4].every((r) => isMarked(g[r][c], called))) return true;
  }
  // Diagonales
  if ([0, 1, 2, 3, 4].every((i) => isMarked(g[i][i], called))) return true;
  if ([0, 1, 2, 3, 4].every((i) => isMarked(g[i][4 - i], called))) return true;
  return false;
}

/** Matriz de marcado (para que el front pinte las casillas). */
export function markGrid(carton: Carton, called: Set<number>): boolean[][] {
  return carton.grid.map((row) => row.map((v) => isMarked(v, called)));
}

/** Letra de la columna de un número (B/I/N/G/O), para anunciarlo. */
export function ballLetter(n: number): string {
  return ["B", "I", "N", "G", "O"][Math.floor((n - 1) / 15)] ?? "";
}
