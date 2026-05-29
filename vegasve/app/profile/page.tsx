import Link from "next/link";

import { SiteNav } from "@/components/site-nav";
import { WalletDialog } from "@/components/wallet-dialog";
import {
  Grid,
  User,
  Shield,
  Cog,
  Logout,
  Check,
  Plus,
  ArrowUpLine,
  ArrowDownLine,
  ArrowUpAlt,
  DominoSimple,
  PokerSimple,
} from "@/components/icons";

type Tx = {
  ic: "in" | "out" | "game";
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  sub: string;
  sign: "pos" | "neg";
  amt: string;
  usd: string;
};

const HISTORY: Tx[] = [
  { ic: "in", Icon: ArrowDownLine, title: "Depósito · Binance Pay", sub: "Hoy, 9:42 PM · Completado", sign: "pos", amt: "+ Bs. 4.000", usd: "+$100,00" },
  { ic: "game", Icon: DominoSimple, title: "Dominó · Mesa #4821", sub: "Hoy, 8:15 PM · Victoria", sign: "pos", amt: "+ Bs. 850", usd: "+$21,25" },
  { ic: "game", Icon: PokerSimple, title: "Póker · Cash game", sub: "Ayer, 11:30 PM · Sin suerte", sign: "neg", amt: "− Bs. 1.200", usd: "−$30,00" },
  { ic: "out", Icon: ArrowUpAlt, title: "Retiro · Pago Móvil", sub: "26 may, 4:02 PM · Procesado", sign: "neg", amt: "− Bs. 2.000", usd: "−$50,00" },
  { ic: "in", Icon: ArrowDownLine, title: "Bono de bienvenida", sub: "24 may, 1:18 PM · Acreditado", sign: "pos", amt: "+ Bs. 1.500", usd: "+$37,50" },
  { ic: "game", Icon: DominoSimple, title: "Dominó · Torneo nocturno", sub: "24 may, 12:05 AM · 2.º lugar", sign: "pos", amt: "+ Bs. 3.200", usd: "+$80,00" },
];

export default function ProfilePage() {
  return (
    <>
      <SiteNav variant="in" />

      <section className="view">
        <div className="wrap profile-wrap">
          {/* left column */}
          <aside>
            <div className="pcard profile-id">
              <div className="av-lg">R</div>
              <div className="pname">Rafael Méndez</div>
              <div className="pmeta">@rafamendez · Caracas</div>
              <div className="verified">
                <Check strokeWidth={2} /> Cuenta verificada
              </div>

              <div className="pstats">
                <div className="ps">
                  <div className="n">248</div>
                  <div className="l">Partidas</div>
                </div>
                <div className="ps">
                  <div className="n">61%</div>
                  <div className="l">Victorias</div>
                </div>
              </div>

              <nav className="menu-list">
                <Link href="/lobby">
                  <Grid /> Volver al lobby
                </Link>
                <a>
                  <User /> Datos personales
                </a>
                <a>
                  <Shield /> Seguridad
                </a>
                <a>
                  <Cog /> Preferencias
                </a>
                <Link href="/" className="danger">
                  <Logout /> Cerrar sesión
                </Link>
              </nav>
            </div>
          </aside>

          {/* right column */}
          <div>
            {/* balance feature */}
            <div className="balance-feature">
              <div className="k">Saldo total disponible</div>
              <div className="amount">Bs. 12.480</div>
              <div className="usd-line">≈ $312,00 USD · incluye Bs. 1.500 de bono</div>
              <div className="bf-actions">
                <WalletDialog kind="deposit">
                  <button className="btn btn-gold">
                    <Plus strokeWidth={1.8} /> Depositar
                  </button>
                </WalletDialog>
                <WalletDialog kind="withdraw">
                  <button className="btn btn-green">
                    <ArrowUpLine strokeWidth={1.8} /> Retirar
                  </button>
                </WalletDialog>
              </div>
            </div>

            {/* history */}
            <div className="panel">
              <div className="panel-head">
                <h3 className="serif">Historial de movimientos</h3>
                <div className="filters">
                  <button className="active">Todo</button>
                  <button>Pagos</button>
                  <button>Juegos</button>
                </div>
              </div>

              {HISTORY.map((t, i) => (
                <div className="tx" key={i}>
                  <div className={`tx-ic ${t.ic}`}>
                    <t.Icon />
                  </div>
                  <div className="tx-main">
                    <div className="tx-title">{t.title}</div>
                    <div className="tx-sub">{t.sub}</div>
                  </div>
                  <div className={`tx-amt ${t.sign}`}>
                    {t.amt} <span className="sm">{t.usd}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
