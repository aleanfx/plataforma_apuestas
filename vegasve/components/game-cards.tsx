"use client";

import * as React from "react";
import { toast } from "sonner";

import { DominoIcon, PokerIcon } from "@/components/icons";
import { AuthDialog } from "@/components/auth-dialog";

/* ---- Landing: cards prompt registration ---- */
export function LandingGameCards() {
  return (
    <div className="games-grid">
      <AuthDialog defaultTab="register">
        <div className="game-card" role="button" tabIndex={0}>
          <div>
            <div className="gc-icon">
              <DominoIcon />
            </div>
            <h3 className="serif">Dominó</h3>
            <p className="gc-desc">
              El clásico venezolano. Partidas a 100, parejas o todos contra todos.
            </p>
          </div>
          <div className="gc-foot">
            <div className="players">
              <span className="live-dot" /> 1.240 jugando ahora
            </div>
            <span className="tag-stakes">desde Bs. 50</span>
          </div>
        </div>
      </AuthDialog>

      <AuthDialog defaultTab="register">
        <div className="game-card" role="button" tabIndex={0}>
          <div>
            <div className="gc-icon">
              <PokerIcon />
            </div>
            <h3 className="serif">Póker</h3>
            <p className="gc-desc">
              Texas Hold&apos;em en vivo. Cash games y torneos con premios diarios.
            </p>
          </div>
          <div className="gc-foot">
            <div className="players">
              <span className="live-dot" /> 860 jugando ahora
            </div>
            <span className="tag-stakes">desde Bs. 200</span>
          </div>
        </div>
      </AuthDialog>
    </div>
  );
}

/* ---- Lobby: cards launch a game (demo toast) ---- */
function play(name: string) {
  toast("Abriendo mesas de " + name + "…");
}

export function LobbyGameCards() {
  return (
    <div className="games-grid">
      <div className="game-card" onClick={() => play("Dominó")} role="button" tabIndex={0}>
        <div>
          <div className="gc-icon">
            <DominoIcon />
          </div>
          <h3 className="serif">Dominó</h3>
          <p className="gc-desc">12 mesas abiertas a tu nivel ahora mismo.</p>
        </div>
        <div className="gc-foot">
          <div className="players">
            <span className="live-dot" /> 1.240 en línea
          </div>
          <button
            className="btn btn-gold btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              play("Dominó");
            }}
          >
            Jugar ahora
          </button>
        </div>
      </div>

      <div className="game-card" onClick={() => play("Póker")} role="button" tabIndex={0}>
        <div>
          <div className="gc-icon">
            <PokerIcon />
          </div>
          <h3 className="serif">Póker</h3>
          <p className="gc-desc">Torneo «Noche VE» empieza en 18 min · Bote Bs. 80.000.</p>
        </div>
        <div className="gc-foot">
          <div className="players">
            <span className="live-dot" /> 860 en línea
          </div>
          <button
            className="btn btn-gold btn-sm"
            onClick={(e) => {
              e.stopPropagation();
              play("Póker");
            }}
          >
            Jugar ahora
          </button>
        </div>
      </div>
    </div>
  );
}
