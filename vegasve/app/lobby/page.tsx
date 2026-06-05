import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { LobbyGameCards } from "@/components/game-cards";
import { ComingSoon } from "@/components/coming-soon";
import { WalletDialog } from "@/components/wallet-dialog";
import { Plus } from "@/components/icons";

export default function LobbyPage() {
  return (
    <>
      <SiteNav variant="in" />
      <Ticker />

      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <div className="hi">Buenas noches,</div>
            <h1>
              Hola de nuevo, <span className="u">Rafael</span>
            </h1>
          </div>

          {/* balance banner */}
          <div className="bal-banner">
            <div className="cell">
              <div className="k">Saldo disponible</div>
              <div className="big">Bs. 12.480</div>
              <div className="sub">≈ $312,00 USD · Tasa Bs. 40,00</div>
            </div>
            <div className="cell">
              <div className="k">Bono activo</div>
              <div className="mid gold">Bs. 1.500</div>
              <div className="sub">Liberable jugando</div>
            </div>
            <div className="cell">
              <div className="k">En juego</div>
              <div className="mid">Bs. 0</div>
              <div className="sub">Sin mesas abiertas</div>
            </div>
            <div className="cell lobby-actions-cell">
              <WalletDialog kind="deposit">
                <button className="btn btn-gold btn-sm btn-block">
                  <Plus strokeWidth={1.8} /> Depositar
                </button>
              </WalletDialog>
              <WalletDialog kind="withdraw">
                <button className="btn btn-ghost btn-sm btn-block">Retirar</button>
              </WalletDialog>
            </div>
          </div>

          <LobbyGameCards />

          <div style={{ margin: "42px 0 70px" }}>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Próximamente en BetmarPlay
            </div>
            <ComingSoon />
          </div>
        </div>
      </section>
    </>
  );
}
