"use client";

import * as React from "react";
import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { WalletDialog } from "@/components/wallet-dialog";
import { Plus, Check } from "@/components/icons";
import { toast } from "sonner";

const MATCHES = [
  {
    id: 1,
    sport: "⚽ Fútbol",
    local: "Manchester United",
    visitante: "Liverpool",
    odds: { local: 2.1, empate: 3.2, visitante: 2.4 }
  },
  {
    id: 2,
    sport: "⚽ Fútbol",
    local: "Real Madrid",
    visitante: "Barcelona",
    odds: { local: 1.8, empate: 3.5, visitante: 2.8 }
  },
  {
    id: 3,
    sport: "🏀 Baloncesto",
    local: "Lakers",
    visitante: "Celtics",
    odds: { local: 2.2, empate: 3.0, visitante: 2.3 }
  },
  {
    id: 4,
    sport: "⚾ Béisbol",
    local: "Yankees",
    visitante: "Red Sox",
    odds: { local: 2.4, empate: 3.0, visitante: 2.1 }
  },
  {
    id: 5,
    sport: "⚽ Fútbol",
    local: "PSG",
    visitante: "AS Monaco",
    odds: { local: 1.5, empate: 4.0, visitante: 3.2 }
  },
];

type SelectionKey = "local" | "empate" | "visitante";

export default function ParleyPage() {
  const [selections, setSelections] = React.useState<Record<number, SelectionKey | null>>({});
  const [bet, setBet] = React.useState("100");

  const selectOption = (matchId: number, option: SelectionKey) => {
    setSelections(prev => ({
      ...prev,
      [matchId]: prev[matchId] === option ? null : option
    }));
  };

  const selectedMatches = Object.values(selections).filter(s => s !== null).length;

  let totalOdds = 1;
  MATCHES.forEach(match => {
    const sel = selections[match.id];
    if (sel) {
      totalOdds *= match.odds[sel];
    }
  });

  const potentialWinnings = Math.round((parseInt(bet) || 0) * totalOdds * 100) / 100;

  const handleBet = () => {
    if (selectedMatches === 0) {
      toast.error("Selecciona al menos un pronóstico");
      return;
    }
    toast.success(`¡Apuesta realizada! Monto: Bs. ${bet}`);
  };

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <h1>Parley · Pronósticos Deportivos</h1>
            <p style={{ color: "var(--text-2)", marginTop: 8 }}>Acumula pronósticos y multiplica tus ganancias</p>
          </div>

          <div className="bal-banner" style={{ marginBottom: 32 }}>
            <div className="cell">
              <div className="k">Saldo disponible</div>
              <div className="big">Bs. 12.480</div>
              <div className="sub">≈ $312,00 USD</div>
            </div>
            <div className="cell lobby-actions-cell">
              <WalletDialog kind="deposit">
                <button className="btn btn-gold btn-sm btn-block">
                  <Plus strokeWidth={1.8} /> Depositar
                </button>
              </WalletDialog>
            </div>
          </div>

          <div className="game-layout">
            {/* Matches */}
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <h2 style={{ fontSize: 20 }}>Partidos disponibles</h2>
              {MATCHES.map(match => (
                <div key={match.id} className="game-panel" style={{ padding: 20 }}>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 12 }}>
                    {match.sport}
                  </div>
                  <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 16 }}>
                    {match.local} vs {match.visitante}
                  </div>
                  <div className="game-grid-3">
                    {(["local", "empate", "visitante"] as const).map(option => {
                      const isSelected = selections[match.id] === option;
                      const label = option === "local" ? match.local : option === "empate" ? "Empate" : match.visitante;
                      return (
                        <button
                          key={option}
                          onClick={() => selectOption(match.id, option)}
                          className={`game-opt${isSelected ? " sel" : ""}`}
                        >
                          <div>{label}</div>
                          <div style={{ fontSize: 11, opacity: 0.8 }}>
                            @{match.odds[option]}
                          </div>
                          {isSelected && (
                            <Check strokeWidth={3} className="tick" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Sidebar */}
            <div className="game-side">
              {/* Acumulador */}
              <div className="game-panel">
                <h3 style={{ marginBottom: 16 }}>Tus selecciones</h3>
                {selectedMatches === 0 ? (
                  <div style={{ color: "var(--text-2)", fontSize: 14 }}>
                    Selecciona pronósticos para ver el acumulador
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {MATCHES.map(match => {
                      if (!selections[match.id]) return null;
                      const label = selections[match.id] === "local" ? match.local :
                                   selections[match.id] === "empate" ? "Empate" :
                                   match.visitante;
                      return (
                        <div key={match.id} style={{
                          padding: 10,
                          background: "var(--black)",
                          borderRadius: 6,
                          fontSize: 13,
                          display: "flex",
                          justifyContent: "space-between"
                        }}>
                          <span>{label}</span>
                          <span className="gold">@{match.odds[selections[match.id]!]}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Monto y ganancias */}
              <div className="game-panel">
                <h3 style={{ marginBottom: 14 }}>Monto de apuesta</h3>
                <div className="input-wrap" style={{ marginBottom: 20 }}>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(e.target.value)}
                    min="10"
                    step="10"
                    style={{ width: "100%", paddingLeft: 12 }}
                  />
                </div>

                <div style={{ background: "var(--black)", borderRadius: 8, padding: 16, marginBottom: 16 }}>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: 6 }}>
                    Cuota total: {totalOdds.toFixed(2)}x
                  </div>
                  <div style={{ fontSize: 20, fontWeight: 600, color: "var(--gold)" }}>
                    Bs. {potentialWinnings.toLocaleString()}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
                    Ganancia potencial
                  </div>
                </div>

                <button className="btn btn-gold btn-block" onClick={handleBet} disabled={selectedMatches === 0}>
                  Realizar apuesta
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
