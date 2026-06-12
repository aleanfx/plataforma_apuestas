import pokersolver from "pokersolver";
import type { Card } from "./cards.js";

const { Hand } = pokersolver;

// Evalúa la mejor mano de 5 entre las 7 cartas (2 propias + 5 comunitarias) de
// cada jugador y devuelve los ids ganadores (puede haber empate / split).
export function winnersAmong(
  players: { id: string; hole: Card[] }[],
  community: Card[],
): string[] {
  const solved = players.map((p) => ({
    id: p.id,
    hand: Hand.solve([...p.hole, ...community]),
  }));
  const winning = Hand.winners(solved.map((s) => s.hand));
  return solved.filter((s) => winning.includes(s.hand)).map((s) => s.id);
}

/** Nombre legible de la mejor mano de un jugador (para el showdown). */
export function handName(hole: Card[], community: Card[]): string {
  return Hand.solve([...hole, ...community]).name;
}
