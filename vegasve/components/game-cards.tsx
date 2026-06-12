"use client";

import * as React from "react";
import Link from "next/link";

import {
  DominoIcon,
  PokerIcon,
  Gamepad,
  Dice,
  Coins,
  Roulette,
  Blackjack,
  Slots,
} from "@/components/icons";
import { AuthDialog } from "@/components/auth-dialog";

/* Imagen de fondo de cada tarjeta (en public/games/).
   Fijamos cover/center inline para que no se pierdan en móvil. */
const cardBg = (slug: string): React.CSSProperties => ({
  backgroundImage: `url(/games/${slug}.jpg)`,
  backgroundSize: "cover",
  backgroundPosition: "center",
  backgroundRepeat: "no-repeat",
});

/* Juegos disponibles — mismos en inicio y lobby */
const GAMES = [
  { slug: "domino", Icon: DominoIcon, name: "Dominó", desc: "El clásico venezolano. Partidas a 100, parejas o todos contra todos.", players: "1.240", stakes: "desde Bs. 50", href: "/domino", demo: null },
  { slug: "poker", Icon: PokerIcon, name: "Póker", desc: "Texas Hold'em en vivo. Cash games y torneos con premios diarios.", players: "860", stakes: "desde Bs. 200", href: "/poker", demo: null },
  { slug: "bingo", Icon: Gamepad, name: "Bingo", desc: "Cartones progresivos · Premios cada 2 minutos.", players: "456", stakes: "desde Bs. 20", href: "/bingo", demo: null },
  { slug: "parley", Icon: Coins, name: "Parley", desc: "Pronósticos deportivos · Acumula y gana hasta 100x.", players: "892", stakes: "multiplica x100", href: "/parley", demo: null },
  { slug: "caballos", Icon: Dice, name: "Caballos", desc: "Pollas hípicas · Apuesta y predice a los ganadores.", players: "623", stakes: "desde Bs. 100", href: "/caballos", demo: null },
] as const;

/* Próximamente — se ven como juegos (con foto), atenuados y con sello "Pronto" */
const SOON = [
  { slug: "ruleta", name: "Ruleta", Icon: Roulette },
  { slug: "blackjack", name: "Blackjack", Icon: Blackjack },
  { slug: "dados", name: "Dados", Icon: Dice },
  { slug: "tragamonedas", name: "Tragamonedas", Icon: Slots },
  { slug: "ludo", name: "Ludo", Icon: Gamepad },
] as const;

function soonCards() {
  return SOON.map(({ slug, name, Icon }) => (
    <div className="game-card soon" key={slug} aria-disabled="true" style={cardBg(slug)}>
      <div>
        <div className="gc-icon">
          <Icon />
        </div>
        <h3 className="serif">{name}</h3>
        <p className="gc-desc">Muy pronto en BetmarPlay.</p>
      </div>
      <div className="gc-foot">
        <span className="gc-badge">Pronto</span>
      </div>
    </div>
  ));
}

/* ---- Landing: cada tarjeta invita a registrarse ---- */
export function LandingGameCards() {
  return (
    <div className="games-grid">
      {GAMES.map((g) => (
        <AuthDialog key={g.slug} defaultTab="register">
          <div className="game-card" role="button" tabIndex={0} style={cardBg(g.slug)}>
            <div>
              <div className="gc-icon">
                <g.Icon />
              </div>
              <h3 className="serif">{g.name}</h3>
              <p className="gc-desc">{g.desc}</p>
            </div>
            <div className="gc-foot">
              <div className="players">
                <span className="live-dot" /> {g.players} jugando ahora
              </div>
              <span className="tag-stakes">{g.stakes}</span>
            </div>
          </div>
        </AuthDialog>
      ))}
      {soonCards()}
    </div>
  );
}

/* ---- Lobby: cada tarjeta abre el juego ---- */
function LobbyFoot({ g }: { g: (typeof GAMES)[number] }) {
  return (
    <div className="gc-foot">
      <div className="players">
        <span className="live-dot" /> {g.players} en línea
      </div>
      <span className="btn btn-gold btn-sm">Jugar ahora</span>
    </div>
  );
}

export function LobbyGameCards() {
  return (
    <div className="games-grid">
      {GAMES.map((g) => (
        <Link key={g.slug} href={g.href} className="game-card" style={cardBg(g.slug)}>
          <div>
            <div className="gc-icon">
              <g.Icon />
            </div>
            <h3 className="serif">{g.name}</h3>
            <p className="gc-desc">{g.desc}</p>
          </div>
          <LobbyFoot g={g} />
        </Link>
      ))}
      {soonCards()}
    </div>
  );
}
