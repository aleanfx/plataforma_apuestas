import crypto from "node:crypto";

// Dominó doble-seis: 28 fichas [a,b] con 0 <= a <= b <= 6.
export type Tile = { id: string; a: number; b: number };

export function fullSet(): Tile[] {
  const tiles: Tile[] = [];
  for (let a = 0; a <= 6; a++) {
    for (let b = a; b <= 6; b++) {
      tiles.push({ id: `${a}-${b}`, a, b });
    }
  }
  return tiles; // 28
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = crypto.randomInt(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export const pip = (t: Tile) => t.a + t.b;
export const isDouble = (t: Tile) => t.a === t.b;

/** Suma de puntos de una mano (para desempate por tranque). */
export const handPips = (hand: Tile[]) => hand.reduce((s, t) => s + pip(t), 0);

/** Ficha de salida: el doble más alto; si no hay dobles, la ficha de mayor puntaje. */
export function starterTile(tiles: Tile[]): Tile {
  const doubles = tiles.filter(isDouble).sort((x, y) => y.a - x.a);
  if (doubles.length) return doubles[0];
  return [...tiles].sort((x, y) => pip(y) - pip(x) || Math.max(y.a, y.b) - Math.max(x.a, x.b))[0];
}

/** ¿La ficha encaja en alguno de los extremos abiertos? Devuelve los lados válidos. */
export function playableEnds(tile: Tile, leftEnd: number, rightEnd: number): ("left" | "right")[] {
  const ends: ("left" | "right")[] = [];
  if (tile.a === leftEnd || tile.b === leftEnd) ends.push("left");
  if (tile.a === rightEnd || tile.b === rightEnd) ends.push("right");
  return ends;
}
