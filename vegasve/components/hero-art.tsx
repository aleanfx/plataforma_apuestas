import { Spade, Heart } from "@/components/icons";

export function HeroArt() {
  return (
    <div className="hero-art">
      <div className="glow" />
      <div className="suit-card c1">
        <span className="corner tl">A</span>
        <Spade />
        <span className="corner br">A</span>
      </div>
      <div className="suit-card c2">
        <span className="corner tl">K</span>
        <Heart />
        <span className="corner br">K</span>
      </div>
      <div className="float-domino">
        <div className="half">
          <div className="pips p3">
            <span className="pip" />
            <span className="pip" />
            <span className="pip" />
          </div>
        </div>
        <div className="div" />
        <div className="half">
          <div className="pips p2">
            <span className="pip" />
            <span className="pip" />
          </div>
        </div>
      </div>
    </div>
  );
}
