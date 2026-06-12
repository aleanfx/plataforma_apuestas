// Declaración mínima de tipos para pokersolver (no trae los suyos).
declare module "pokersolver" {
  export class Hand {
    name: string;
    descr: string;
    rank: number;
    static solve(cards: string[]): Hand;
    static winners(hands: Hand[]): Hand[];
  }
  export class Card {}
  export class Game {}
  const _default: { Hand: typeof Hand; Card: typeof Card; Game: typeof Game };
  export default _default;
}
