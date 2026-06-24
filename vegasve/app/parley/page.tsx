"use client";

import * as React from "react";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { AuthGuard } from "@/components/auth-guard";
import { Check } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/lib/currency-context";

type Match = {
  id: number;
  sport: string;
  league: string;
  local: string;
  visitante: string;
  hora: string;
  odds: { local: number; empate: number; visitante: number };
};

const MATCHES: Match[] = [
  { id: 1, sport: "Fútbol", league: "Premier League", local: "Man. United", visitante: "Liverpool", hora: "Hoy 3:00 PM", odds: { local: 2.1, empate: 3.2, visitante: 2.4 } },
  { id: 2, sport: "Fútbol", league: "LaLiga", local: "Real Madrid", visitante: "Barcelona", hora: "Hoy 4:00 PM", odds: { local: 1.8, empate: 3.5, visitante: 2.8 } },
  { id: 3, sport: "Baloncesto", league: "NBA", local: "Lakers", visitante: "Celtics", hora: "Hoy 8:00 PM", odds: { local: 2.2, empate: 15.0, visitante: 1.7 } },
  { id: 4, sport: "Béisbol", league: "MLB", local: "Yankees", visitante: "Red Sox", hora: "Hoy 7:05 PM", odds: { local: 2.4, empate: 12.0, visitante: 2.1 } },
  { id: 5, sport: "Fútbol", league: "Ligue 1", local: "PSG", visitante: "AS Monaco", hora: "Mañana 2:00 PM", odds: { local: 1.5, empate: 4.0, visitante: 3.2 } },
];

type SelKey = "local" | "empate" | "visitante";

function ParleyContent() {
  const { user } = useAuth();
  const { fmt } = useCurrency();
  const balance = user?.balance ?? 0;
  const [selections, setSelections] = React.useState<Record<number, SelKey | null>>({});
  const [bet, setBet] = React.useState("100");

  const select = (matchId: number, option: SelKey) =>
    setSelections((prev) => ({ ...prev, [matchId]: prev[matchId] === option ? null : option }));

  const selected = Object.entries(selections).filter(([, v]) => v != null) as [string, SelKey][];
  const totalOdds = selected.reduce((acc, [id, opt]) => {
    const m = MATCHES.find((x) => x.id === Number(id));
    return m ? acc * m.odds[opt] : acc;
  }, 1);
  const stakeNum = Math.max(0, Number(bet) || 0);
  const potential = Math.round(stakeNum * (selected.length ? totalOdds : 0) * 100) / 100;

  const labelFor = (m: Match, opt: SelKey) => (opt === "local" ? m.local : opt === "visitante" ? m.visitante : "Empate");

  function place() {
    if (selected.length === 0) return toast.error("Selecciona al menos un pronóstico");
    if (stakeNum <= 0) return toast.error("Indica un monto válido");
    toast("Apuestas deportivas en preparación", {
      description: "Tu parley quedó armado. La activación de apuestas reales llega muy pronto.",
    });
  }

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <h1>Parley · Deportes</h1>
            <p style={{ color: "var(--text-2)", marginTop: 8 }}>
              Combina pronósticos y multiplica tu cuota.
              <span className="soon-pill">Próximamente apuestas reales</span>
            </p>
          </div>

          <div className="bal-banner" style={{ marginBottom: 24 }}>
            <div className="cell">
              <div className="k">Tu saldo</div>
              <div className="big">{fmt(balance)}</div>
            </div>
          </div>

          <div className="game-layout">
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <h2 style={{ fontSize: 20 }}>Partidos de hoy</h2>
              {MATCHES.map((m) => (
                <div key={m.id} className="game-panel sb-match">
                  <div className="sb-match-head">
                    <span className="sb-league">{m.sport} · {m.league}</span>
                    <span className="sb-time">{m.hora}</span>
                  </div>
                  <div className="sb-teams">{m.local} <span className="sb-vs">vs</span> {m.visitante}</div>
                  <div className="sb-opts">
                    {(["local", "empate", "visitante"] as const).map((opt) => {
                      const on = selections[m.id] === opt;
                      return (
                        <button key={opt} className={`sb-opt${on ? " on" : ""}`} onClick={() => select(m.id, opt)}>
                          <span className="sb-opt-k">{opt === "local" ? "1" : opt === "empate" ? "X" : "2"}</span>
                          <span className="sb-opt-l">{labelFor(m, opt)}</span>
                          <span className="sb-opt-v">{m.odds[opt].toFixed(2)}</span>
                          {on && <Check strokeWidth={3} className="tick" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Bet slip */}
            <div className="game-side">
              <div className="game-panel">
                <h3 style={{ marginBottom: 14 }}>Tu parley {selected.length > 0 && <span className="sb-count">{selected.length}</span>}</h3>
                {selected.length === 0 ? (
                  <div style={{ color: "var(--text-2)", fontSize: 14 }}>Selecciona pronósticos para armar tu parley.</div>
                ) : (
                  <div className="sb-slip">
                    {selected.map(([id, opt]) => {
                      const m = MATCHES.find((x) => x.id === Number(id))!;
                      return (
                        <div key={id} className="sb-slip-row">
                          <span>{labelFor(m, opt)}</span>
                          <span className="gold">@{m.odds[opt].toFixed(2)}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="input-wrap" style={{ margin: "14px 0" }}>
                  <input
                    type="number"
                    value={bet}
                    onChange={(e) => setBet(e.target.value)}
                    min="10"
                    step="10"
                    style={{ width: "100%", paddingLeft: 12 }}
                  />
                </div>

                <div className="hp-payout">
                  <span>Cuota total</span>
                  <strong>{(selected.length ? totalOdds : 0).toFixed(2)}x</strong>
                </div>
                <div className="hp-payout" style={{ marginTop: 6 }}>
                  <span>Ganancia potencial</span>
                  <strong style={{ color: "var(--gold)" }}>{fmt(Math.round(potential * 100))}</strong>
                </div>

                <button className="btn btn-gold btn-block" style={{ marginTop: 16 }} onClick={place} disabled={selected.length === 0}>
                  Realizar parley
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

export default function ParleyPage() {
  return (
    <AuthGuard>
      <ParleyContent />
    </AuthGuard>
  );
}
