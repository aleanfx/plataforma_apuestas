"use client";

import * as React from "react";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { Check } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { formatBs } from "@/lib/money";

type Horse = { number: number; name: string; jockey: string; win: number; place: number; show: number };
type Race = { id: number; name: string; hippodrome: string; time: string; horses: Horse[] };

const RACES: Race[] = [
  {
    id: 1,
    name: "1ª Carrera",
    hippodrome: "La Rinconada",
    time: "12:30 PM",
    horses: [
      { number: 1, name: "Rayo Negro", jockey: "J. Pérez", win: 2.3, place: 1.5, show: 1.2 },
      { number: 2, name: "Tormenta", jockey: "L. Gómez", win: 3.1, place: 1.8, show: 1.3 },
      { number: 3, name: "Velocidad", jockey: "M. Díaz", win: 2.8, place: 1.7, show: 1.3 },
      { number: 4, name: "Fuego", jockey: "R. Mora", win: 4.2, place: 2.1, show: 1.5 },
      { number: 5, name: "Luz", jockey: "A. Ruiz", win: 3.5, place: 1.9, show: 1.4 },
      { number: 6, name: "Viento", jockey: "C. Sosa", win: 2.9, place: 1.7, show: 1.3 },
    ],
  },
  {
    id: 2,
    name: "2ª Carrera",
    hippodrome: "La Rinconada",
    time: "1:15 PM",
    horses: [
      { number: 1, name: "Campeón", jockey: "J. Pérez", win: 2.1, place: 1.4, show: 1.2 },
      { number: 2, name: "Victoria", jockey: "L. Gómez", win: 2.5, place: 1.6, show: 1.3 },
      { number: 3, name: "Trueno", jockey: "M. Díaz", win: 3.8, place: 2.0, show: 1.5 },
      { number: 4, name: "Diamante", jockey: "R. Mora", win: 2.6, place: 1.6, show: 1.3 },
      { number: 5, name: "Salto", jockey: "A. Ruiz", win: 4.0, place: 2.1, show: 1.5 },
      { number: 6, name: "Destello", jockey: "C. Sosa", win: 3.2, place: 1.8, show: 1.4 },
    ],
  },
  {
    id: 3,
    name: "3ª Carrera",
    hippodrome: "Valencia",
    time: "2:00 PM",
    horses: [
      { number: 1, name: "Pegaso", jockey: "J. Pérez", win: 3.5, place: 1.9, show: 1.4 },
      { number: 2, name: "Brío", jockey: "L. Gómez", win: 2.8, place: 1.7, show: 1.3 },
      { number: 3, name: "Galopante", jockey: "M. Díaz", win: 2.4, place: 1.5, show: 1.2 },
      { number: 4, name: "Esperanza", jockey: "R. Mora", win: 3.9, place: 2.0, show: 1.5 },
      { number: 5, name: "Fortuna", jockey: "A. Ruiz", win: 2.7, place: 1.6, show: 1.3 },
      { number: 6, name: "Gloria", jockey: "C. Sosa", win: 4.5, place: 2.2, show: 1.6 },
    ],
  },
];

type BetType = "win" | "place" | "show";
type PositionKey = "1ro" | "2do" | "3ro";
const BET_LABEL: Record<BetType, string> = { win: "Ganador", place: "Place", show: "Show" };

function CaballosContent() {
  const { user } = useAuth();
  const balance = user?.balance ?? 0;
  const [mode, setMode] = React.useState<"carrera" | "polla">("carrera");

  // --- Carrera (Ganador / Place / Show) ---
  const [pick, setPick] = React.useState<{ raceId: number; horse: number; type: BetType } | null>(null);
  const [stake, setStake] = React.useState("100");
  const stakeNum = Math.max(0, Number(stake) || 0);
  const pickedHorse = pick ? RACES.find((r) => r.id === pick.raceId)?.horses.find((h) => h.number === pick.horse) : null;
  const odds = pickedHorse ? pickedHorse[pick!.type] : 0;
  const potential = Math.round(stakeNum * odds * 100) / 100;

  // --- Polla (puntos acumulados) ---
  const [selections, setSelections] = React.useState<Record<string, number | null>>({});
  const selectPolla = (raceId: number, position: PositionKey, horse: number) => {
    const key = `${raceId}-${position}`;
    setSelections((prev) => ({ ...prev, [key]: prev[key] === horse ? null : horse }));
  };
  const pollaCount = Object.values(selections).filter((s) => s != null).length;
  let pollaPoints = 0;
  Object.entries(selections).forEach(([key, v]) => {
    if (v == null) return;
    const pos = key.split("-")[1];
    pollaPoints += pos === "1ro" ? 5 : pos === "2do" ? 3 : 1;
  });

  function place() {
    if (mode === "carrera") {
      if (!pick) return toast.error("Elige un caballo y tipo de apuesta");
      if (stakeNum <= 0) return toast.error("Indica un monto válido");
    } else if (pollaCount === 0) {
      return toast.error("Selecciona al menos un caballo para tu polla");
    }
    toast("Apuestas hípicas en preparación", {
      description: "Tu jugada quedó lista. La activación de apuestas reales llega muy pronto.",
    });
  }

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <h1>Caballos · Hípica</h1>
            <p style={{ color: "var(--text-2)", marginTop: 8 }}>
              Carreras de La Rinconada y Valencia. Apuesta a Ganador, Place y Show, o arma tu Polla.
              <span className="soon-pill">Próximamente apuestas reales</span>
            </p>
          </div>

          <div className="bal-banner" style={{ marginBottom: 24 }}>
            <div className="cell">
              <div className="k">Tu saldo</div>
              <div className="big">{formatBs(balance)}</div>
            </div>
          </div>

          <div className="seg-tabs" style={{ marginBottom: 22 }}>
            <button className={`seg-tab${mode === "carrera" ? " on" : ""}`} onClick={() => setMode("carrera")}>
              Carrera (Ganador/Place/Show)
            </button>
            <button className={`seg-tab${mode === "polla" ? " on" : ""}`} onClick={() => setMode("polla")}>
              Polla Hípica (puntos)
            </button>
          </div>

          <div className="game-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {RACES.map((race) => (
                <div key={race.id} className="game-panel hp-race">
                  <div className="hp-race-head">
                    <div>
                      <h3 style={{ fontSize: 17 }}>{race.name}</h3>
                      <span className="hp-race-sub">{race.hippodrome} · {race.time}</span>
                    </div>
                  </div>

                  {mode === "carrera" ? (
                    <div className="hp-horses">
                      {race.horses.map((h) => {
                        const sel = pick?.raceId === race.id && pick.horse === h.number;
                        return (
                          <div key={h.number} className={`hp-horse${sel ? " sel" : ""}`}>
                            <div className="hp-horse-id">
                              <span className="hp-num">{h.number}</span>
                              <div>
                                <div className="hp-name">{h.name}</div>
                                <div className="hp-jockey">{h.jockey}</div>
                              </div>
                            </div>
                            <div className="hp-odds">
                              {(["win", "place", "show"] as const).map((t) => {
                                const on = sel && pick?.type === t;
                                return (
                                  <button
                                    key={t}
                                    className={`hp-odd${on ? " on" : ""}`}
                                    onClick={() => setPick({ raceId: race.id, horse: h.number, type: t })}
                                  >
                                    <span className="hp-odd-k">{BET_LABEL[t]}</span>
                                    <span className="hp-odd-v">{h[t].toFixed(2)}</span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    (["1ro", "2do", "3ro"] as const).map((position) => (
                      <div key={position} style={{ marginBottom: 12 }}>
                        <div className="hp-pos-label">
                          {position === "1ro" ? "Primer lugar · +5pts" : position === "2do" ? "Segundo lugar · +3pts" : "Tercer lugar · +1pt"}
                        </div>
                        <div className="game-grid-3">
                          {race.horses.map((h) => {
                            const isSel = selections[`${race.id}-${position}`] === h.number;
                            return (
                              <button
                                key={h.number}
                                onClick={() => selectPolla(race.id, position, h.number)}
                                className={`game-opt${isSel ? " sel" : ""}`}
                                style={{ fontSize: 12 }}
                              >
                                <div>#{h.number}</div>
                                <div style={{ fontSize: 11, opacity: 0.9 }}>{h.name}</div>
                                {isSel && <Check strokeWidth={3} className="tick" />}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              ))}
            </div>

            {/* Slip */}
            <div className="game-side">
              <div className="game-panel">
                <h3 style={{ marginBottom: 14 }}>Tu jugada</h3>
                {mode === "carrera" ? (
                  pick && pickedHorse ? (
                    <div className="hp-slip">
                      <div className="hp-slip-row">
                        <span>{pickedHorse.name} · {BET_LABEL[pick.type]}</span>
                        <span className="gold">@{odds.toFixed(2)}</span>
                      </div>
                      <div className="input-wrap" style={{ margin: "14px 0" }}>
                        <input
                          type="number"
                          value={stake}
                          onChange={(e) => setStake(e.target.value)}
                          min="10"
                          step="10"
                          style={{ width: "100%", paddingLeft: 12 }}
                        />
                      </div>
                      <div className="hp-payout">
                        <span>Ganancia potencial</span>
                        <strong>{formatBs(Math.round(potential * 100))}</strong>
                      </div>
                    </div>
                  ) : (
                    <div style={{ color: "var(--text-2)", fontSize: 14 }}>Elige un caballo y tipo de apuesta.</div>
                  )
                ) : pollaCount === 0 ? (
                  <div style={{ color: "var(--text-2)", fontSize: 14 }}>Selecciona caballos para tu polla.</div>
                ) : (
                  <div className="hp-payout" style={{ marginBottom: 4 }}>
                    <span>Puntos totales ({pollaCount} sel.)</span>
                    <strong style={{ color: "var(--gold)" }}>{pollaPoints}</strong>
                  </div>
                )}

                <button
                  className="btn btn-gold btn-block"
                  style={{ marginTop: 16 }}
                  onClick={place}
                  disabled={mode === "carrera" ? !pick : pollaCount === 0}
                >
                  {mode === "carrera" ? "Apostar" : "Sellar polla"}
                </button>
                <p className="hp-note">Apuestas en preparación · activación muy pronto.</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

export default function CaballosPage() {
  return (
    <AuthGuard>
      <CaballosContent />
    </AuthGuard>
  );
}
