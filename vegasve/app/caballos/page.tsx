"use client";

import * as React from "react";
import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { WalletDialog } from "@/components/wallet-dialog";
import { Plus, Check } from "@/components/icons";
import { toast } from "sonner";

const RACES = [
  {
    id: 1,
    name: "Primera carrera · 12:30 PM",
    horses: [
      { number: 1, name: "Rayo Negro", odds: 2.3 },
      { number: 2, name: "Tormenta", odds: 3.1 },
      { number: 3, name: "Velocidad", odds: 2.8 },
      { number: 4, name: "Fuego", odds: 4.2 },
      { number: 5, name: "Luz", odds: 3.5 },
      { number: 6, name: "Viento", odds: 2.9 },
    ]
  },
  {
    id: 2,
    name: "Segunda carrera · 1:15 PM",
    horses: [
      { number: 1, name: "Campeón", odds: 2.1 },
      { number: 2, name: "Victoria", odds: 2.5 },
      { number: 3, name: "Trueno", odds: 3.8 },
      { number: 4, name: "Diamante", odds: 2.6 },
      { number: 5, name: "Salto", odds: 4.0 },
      { number: 6, name: "Destello", odds: 3.2 },
    ]
  },
  {
    id: 3,
    name: "Tercera carrera · 2:00 PM",
    horses: [
      { number: 1, name: "Pegaso", odds: 3.5 },
      { number: 2, name: "Brío", odds: 2.8 },
      { number: 3, name: "Galopante", odds: 2.4 },
      { number: 4, name: "Esperanza", odds: 3.9 },
      { number: 5, name: "Fortuna", odds: 2.7 },
      { number: 6, name: "Gloria", odds: 4.5 },
    ]
  },
];

type PositionKey = "1ro" | "2do" | "3ro";

export default function CaballosPage() {
  const [selections, setSelections] = React.useState<Record<string, number | null>>({});
  const [bet, setBet] = React.useState("100");

  const selectHorse = (raceId: number, position: PositionKey, horseNumber: number) => {
    const key = `${raceId}-${position}`;
    setSelections(prev => ({
      ...prev,
      [key]: prev[key] === horseNumber ? null : horseNumber
    }));
  };

  const getHorseName = (raceId: number, horseNumber: number) => {
    const race = RACES.find(r => r.id === raceId);
    return race?.horses.find(h => h.number === horseNumber)?.name;
  };

  const selectedPositions = Object.values(selections).filter(s => s !== null).length;
  let totalPoints = 0;

  Object.entries(selections).forEach(([key, horseNum]) => {
    if (horseNum === null) return;
    const [, position] = key.split("-");
    if (position === "1ro") totalPoints += 5;
    if (position === "2do") totalPoints += 3;
    if (position === "3ro") totalPoints += 1;
  });

  const handleSeal = () => {
    if (selectedPositions === 0) {
      toast.error("Selecciona al menos un caballo");
      return;
    }
    toast.success(`¡Polla sellada! Puntos totales: ${totalPoints} · Monto: Bs. ${bet}`);
  };

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <h1>Caballos · Pollas Hípicas</h1>
            <p style={{ color: "var(--text-2)", marginTop: 8 }}>Apuesta en las carreras de hoy y acumula puntos</p>
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
            {/* Races */}
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <h2 style={{ fontSize: 20 }}>Carreras hoy</h2>
              {RACES.map(race => (
                <div key={race.id} className="game-panel">
                  <h3 style={{ marginBottom: 20, fontSize: 16 }}>{race.name}</h3>

                  {(["1ro", "2do", "3ro"] as const).map(position => (
                    <div key={position} style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 10, fontWeight: 500 }}>
                        {position === "1ro" ? "🥇 Primer lugar" : position === "2do" ? "🥈 Segundo lugar" : "🥉 Tercer lugar"}
                      </div>
                      <div className="game-grid-3">
                        {race.horses.map(horse => {
                          const isSelected = selections[`${race.id}-${position}`] === horse.number;
                          return (
                            <button
                              key={horse.number}
                              onClick={() => selectHorse(race.id, position, horse.number)}
                              className={`game-opt${isSelected ? " sel" : ""}`}
                              style={{ fontSize: 12 }}
                            >
                              <div>#{horse.number}</div>
                              <div style={{ fontSize: 11, opacity: 0.9 }}>
                                {horse.name}
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
              ))}
            </div>

            {/* Sidebar */}
            <div className="game-side">
              {/* Polla */}
              <div className="game-panel">
                <h3 style={{ marginBottom: 16 }}>Tu polla</h3>
                {selectedPositions === 0 ? (
                  <div style={{ color: "var(--text-2)", fontSize: 14 }}>
                    Selecciona caballos para tu polla
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
                    {RACES.map(race => (
                      <React.Fragment key={race.id}>
                        {(["1ro", "2do", "3ro"] as const).map(position => {
                          const horseNum = selections[`${race.id}-${position}`];
                          if (horseNum === null) return null;
                          const horseName = getHorseName(race.id, horseNum);
                          const points = position === "1ro" ? 5 : position === "2do" ? 3 : 1;
                          return (
                            <div key={`${race.id}-${position}`} style={{
                              padding: 10,
                              background: "var(--black)",
                              borderRadius: 6,
                              fontSize: 12,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center"
                            }}>
                              <span>
                                {position === "1ro" ? "🥇" : position === "2do" ? "🥈" : "🥉"} {horseName}
                              </span>
                              <span className="gold">+{points}pts</span>
                            </div>
                          );
                        })}
                      </React.Fragment>
                    ))}
                  </div>
                )}
              </div>

              {/* Puntos y apuesta */}
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
                    Puntos totales
                  </div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: "var(--gold)" }}>
                    {totalPoints}
                  </div>
                  <div style={{ fontSize: 12, color: "var(--text-2)", marginTop: 4 }}>
                    Sistema: 1ro=5pts, 2do=3pts, 3ro=1pt
                  </div>
                </div>

                <button className="btn btn-gold btn-block" onClick={handleSeal} disabled={selectedPositions === 0}>
                  Sellar polla
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
