// Cálculo de pozos (main pot + side pots) a partir de lo que aportó cada jugador
// en la mano. Los jugadores que se retiraron (folded) aportan al pozo pero no
// pueden ganarlo. Si una capa solo tiene aportantes retirados, su dinero pasa a
// los jugadores activos (no se pierde ninguna ficha).

export type Pot = { amount: number; eligible: string[] };

export function computeSidePots(
  contributions: Map<string, number>,
  folded: Set<string>,
): Pot[] {
  const pots: Pot[] = [];
  const remaining = new Map([...contributions].filter(([, v]) => v > 0));
  const activeAll = [...contributions.keys()].filter((id) => !folded.has(id));

  while (remaining.size > 0) {
    const min = Math.min(...remaining.values());
    const contributors = [...remaining.keys()];
    const amount = min * contributors.length;
    let eligible = contributors.filter((id) => !folded.has(id));
    if (eligible.length === 0) eligible = activeAll; // dinero muerto -> a los activos
    pots.push({ amount, eligible });

    for (const id of contributors) {
      const v = remaining.get(id)! - min;
      if (v > 0) remaining.set(id, v);
      else remaining.delete(id);
    }
  }
  return pots;
}
