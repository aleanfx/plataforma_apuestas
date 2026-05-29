import { Roulette, Blackjack, Dice, Slots } from "@/components/icons";

const ITEMS = [
  { nm: "Ruleta", Icon: Roulette },
  { nm: "Blackjack", Icon: Blackjack },
  { nm: "Dados", Icon: Dice },
  { nm: "Tragamonedas", Icon: Slots },
];

export function ComingSoon() {
  return (
    <div className="soon-grid">
      {ITEMS.map(({ nm, Icon }) => (
        <div className="soon-card" key={nm}>
          <Icon />
          <div className="nm">{nm}</div>
          <div className="badge">Pronto</div>
        </div>
      ))}
    </div>
  );
}
