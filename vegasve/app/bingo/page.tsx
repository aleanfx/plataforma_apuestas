"use client";

import * as React from "react";
import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { WalletDialog } from "@/components/wallet-dialog";
import { Plus } from "@/components/icons";
import { toast } from "sonner";

export default function BingoPage() {
  const [carton, setCarton] = React.useState<number[] | null>(null);
  const [called, setCalled] = React.useState<number[]>([]);
  const [bet, setBet] = React.useState("50");
  const [isAnimating, setIsAnimating] = React.useState(false);

  const generateCarton = () => {
    const numbers = Array.from({ length: 75 }, (_, i) => i + 1);
    const selected = numbers.sort(() => Math.random() - 0.5).slice(0, 25);
    setCarton(selected.sort((a, b) => a - b));
    setCalled([]);
    toast.success("¡Cartón generado!");
  };

  const callNumber = () => {
    if (!carton) {
      toast.error("Genera un cartón primero");
      return;
    }
    const uncalled = carton.filter(n => !called.includes(n));
    if (uncalled.length === 0) {
      toast.success("¡Cartón completado! 🎉");
      return;
    }
    const next = uncalled[Math.floor(Math.random() * uncalled.length)];
    setCalled(prev => [...prev, next]);
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
  };

  const handleBuy = () => {
    if (!carton) {
      toast.error("Genera un cartón primero");
      return;
    }
    toast.success(`¡Cartón comprado! Apuesta: Bs. ${bet}`);
  };

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />
      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <h1>Bingo</h1>
            <p style={{ color: "var(--text-2)", marginTop: 8 }}>Compra cartones y gana grandes premios</p>
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
            {/* Cartón */}
            <div className="game-panel">
              <h2 style={{ fontSize: 20, marginBottom: 20 }}>Tu cartón</h2>
              <div className="game-grid-5" style={{ marginBottom: 24 }}>
                {carton ? (
                  carton.map((num) => (
                    <div
                      key={num}
                      className="game-cell"
                      style={{
                        background: called.includes(num) ? "var(--green-bright)" : "var(--purple)",
                        fontSize: 18,
                        color: called.includes(num) ? "#000" : "white",
                      }}
                    >
                      {num}
                    </div>
                  ))
                ) : (
                  <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "var(--text-2)", padding: 40 }}>
                    Genera un cartón para comenzar
                  </div>
                )}
              </div>
              <button className="btn btn-gold btn-block" onClick={generateCarton}>
                Generar cartón
              </button>
            </div>

            {/* Panel derecho */}
            <div className="game-side">
              {/* Números cantados */}
              <div className="game-panel">
                <h2 style={{ fontSize: 20, marginBottom: 16 }}>Números cantados</h2>
                <div className="game-grid-5" style={{ marginBottom: 20, minHeight: 160 }}>
                  {called.length > 0 ? (
                    called.slice(-25).map((num, idx) => (
                      <div
                        key={idx}
                        style={{
                          padding: "8px 4px",
                          background: "var(--purple-bright)",
                          borderRadius: 6,
                          textAlign: "center",
                          fontSize: 14,
                          fontWeight: 600,
                          animation: isAnimating && idx === called.length - 1 ? "pulse 0.6s ease-out" : "none"
                        }}
                      >
                        {num}
                      </div>
                    ))
                  ) : (
                    <div style={{ gridColumn: "1 / -1", color: "var(--text-2)" }}>
                      Los números aparecerán aquí
                    </div>
                  )}
                </div>
                <button className="btn btn-ghost btn-block" onClick={callNumber} disabled={!carton}>
                  Cantar número
                </button>
              </div>

              {/* Apuesta */}
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
                <div style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 16 }}>
                  Potencial: Bs. {(parseInt(bet) * 5).toLocaleString()}
                </div>
                <button className="btn btn-gold btn-block" onClick={handleBuy} disabled={!carton}>
                  Comprar cartón
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        @keyframes pulse {
          0% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); opacity: 0.6; }
        }
      `}</style>
    </>
  );
}
