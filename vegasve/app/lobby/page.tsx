"use client";

import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { LobbyGameCards } from "@/components/game-cards";
import { SiteFooter } from "@/components/site-footer";
import { WalletDialog } from "@/components/wallet-dialog";
import { AuthGuard } from "@/components/auth-guard";
import { Plus } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { formatBs, formatUsd } from "@/lib/money";

function LobbyContent() {
  const { user } = useAuth();
  const firstName = user?.name.split(" ")[0] ?? "";

  return (
    <>
      <SiteNav variant="in" />
      <Ticker />

      <section className="view">
        <div className="wrap">
          <div className="lobby-head">
            <div className="hi">Buenas noches,</div>
            <h1>
              Hola de nuevo, <span className="u">{firstName}</span>
            </h1>
          </div>

          {/* balance banner */}
          <div className="bal-banner bal-3">
            <div className="cell">
              <div className="k">Saldo disponible</div>
              <div className="big">{formatBs(user?.balance ?? 0)}</div>
              <div className="sub">≈ {formatUsd(user?.balance ?? 0)} USD · Tasa Bs. 40,00</div>
            </div>
            <div className="cell">
              <div className="k">En juego</div>
              <div className="mid">{formatBs(user?.locked ?? 0)}</div>
              <div className="sub">{(user?.locked ?? 0) > 0 ? "En mesas activas" : "Sin mesas abiertas"}</div>
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
        </div>

        <SiteFooter />
      </section>
    </>
  );
}

export default function LobbyPage() {
  return (
    <AuthGuard>
      <LobbyContent />
    </AuthGuard>
  );
}
