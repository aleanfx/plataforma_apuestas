"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { DominoIcon, PokerIcon, Gamepad, Dice, Coins } from "@/components/icons";
import { AuthDialog } from "@/components/auth-dialog";

/* Imagen de fondo de cada tarjeta (colócalas en public/games/).
   Si una imagen falta, la tarjeta usa el degradado oscuro de respaldo. */
const cardBg = (slug: string): React.CSSProperties => ({
  backgroundImage: `url(/games/${slug}.jpg)`,
});

/* ---- Landing: las tarjetas invitan a registrarse ---- */
const LANDING = [
  {
    slug: "domino",
    Icon: DominoIcon,
    name: "Dominó",
    desc: "El clásico venezolano. Partidas a 100, parejas o todos contra todos.",
    players: "1.240 jugando ahora",
    stakes: "desde Bs. 50",
  },
  {
    slug: "poker",
    Icon: PokerIcon,
    name: "Póker",
    desc: "Texas Hold'em en vivo. Cash games y torneos con premios diarios.",
    players: "860 jugando ahora",
    stakes: "desde Bs. 200",
  },
] as const;

export function LandingGameCards() {
  return (
    <div className="games-grid">
      {LANDING.map((g) => (
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
                <span className="live-dot" /> {g.players}
              </div>
              <span className="tag-stakes">{g.stakes}</span>
            </div>
          </div>
        </AuthDialog>
      ))}
    </div>
  );
}

/* ---- Lobby: las tarjetas abren un juego ---- */
function play(name: string) {
  toast("Abriendo mesas de " + name + "…");
}

const LOBBY = [
  { slug: "domino", Icon: DominoIcon, name: "Dominó", desc: "12 mesas abiertas a tu nivel ahora mismo.", players: "1.240 en línea", href: null, demo: "Dominó" },
  { slug: "poker", Icon: PokerIcon, name: "Póker", desc: "Torneo «Noche VE» empieza en 18 min · Bote Bs. 80.000.", players: "860 en línea", href: null, demo: "Póker" },
  { slug: "bingo", Icon: Gamepad, name: "Bingo", desc: "Cartones progresivos · Premios cada 2 minutos.", players: "456 en línea", href: "/bingo", demo: null },
  { slug: "parley", Icon: Coins, name: "Parley", desc: "Pronósticos deportivos · Acumula y gana hasta 100x.", players: "892 en línea", href: "/parley", demo: null },
  { slug: "caballos", Icon: Dice, name: "Caballos", desc: "Pollas hípicas · Apuesta y predice a los ganadores.", players: "623 en línea", href: "/caballos", demo: null },
] as const;

function CardInner({ g }: { g: (typeof LOBBY)[number] }) {
  return (
    <>
      <div>
        <div className="gc-icon">
          <g.Icon />
        </div>
        <h3 className="serif">{g.name}</h3>
        <p className="gc-desc">{g.desc}</p>
      </div>
      <div className="gc-foot">
        <div className="players">
          <span className="live-dot" /> {g.players}
        </div>
        <button
          className="btn btn-gold btn-sm"
          onClick={(e) => {
            e.stopPropagation();
            if (g.demo) play(g.demo);
          }}
        >
          Jugar ahora
        </button>
      </div>
    </>
  );
}

export function LobbyGameCards() {
  return (
    <div className="games-grid">
      {LOBBY.map((g) =>
        g.href ? (
          <Link key={g.slug} href={g.href} className="game-card" style={cardBg(g.slug)}>
            <CardInner g={g} />
          </Link>
        ) : (
          <div
            key={g.slug}
            className="game-card"
            role="button"
            tabIndex={0}
            style={cardBg(g.slug)}
            onClick={() => g.demo && play(g.demo)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                if (g.demo) play(g.demo);
              }
            }}
          >
            <CardInner g={g} />
          </div>
        )
      )}
    </div>
  );
}
