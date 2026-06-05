import { SiteNav } from "@/components/site-nav";
import { Ticker } from "@/components/ticker";
import { HeroArt } from "@/components/hero-art";
import { LandingGameCards } from "@/components/game-cards";
import { ComingSoon } from "@/components/coming-soon";
import { AuthDialog } from "@/components/auth-dialog";
import {
  Shield,
  Clock,
  Check,
  ArrowRight,
  WalletCoins,
  Chat,
} from "@/components/icons";

export default function LandingPage() {
  return (
    <>
      <SiteNav variant="out" />
      <Ticker />

      <section className="view">
        {/* Hero */}
        <div className="hero">
          <div className="wrap hero-grid">
            <div className="hero-copy">
              <div className="eyebrow">Casino &amp; Apuestas · Venezuela</div>
              <h1 className="gold-text" style={{ marginTop: 14 }}>
                Juega como
                <br />
                en Las Vegas
              </h1>
              <p className="hero-sub">
                Dominó y Póker en vivo, mesas en bolívares y dólares, depósitos y
                retiros al instante. La experiencia de casino premium, hecha para
                Venezuela.
              </p>
              <div className="hero-cta">
                <AuthDialog defaultTab="register">
                  <button className="btn btn-gold">
                    <ArrowRight strokeWidth={1.6} />
                    Crear cuenta gratis
                  </button>
                </AuthDialog>
                <AuthDialog defaultTab="login">
                  <button className="btn btn-ghost">Ya tengo cuenta</button>
                </AuthDialog>
              </div>
              <div className="hero-trust">
                <div className="t">
                  <Shield /> Pagos protegidos
                </div>
                <div className="t">
                  <Clock /> Retiros 24/7
                </div>
                <div className="t">
                  <Check /> +18 responsable
                </div>
              </div>
            </div>

            <HeroArt />
          </div>
        </div>

        {/* Games */}
        <div id="games-anchor" />
        <div className="wrap section">
          <div className="section-head">
            <div>
              <div className="eyebrow">En la mesa</div>
              <h2 style={{ marginTop: 12 }}>Nuestros juegos</h2>
              <p>Mesas en vivo, todos los niveles. Entra con Bs. o USD.</p>
            </div>
            <AuthDialog defaultTab="register">
              <button className="btn btn-ghost btn-sm">Ver todas las mesas</button>
            </AuthDialog>
          </div>

          <LandingGameCards />

          <div style={{ marginTop: 46 }}>
            <div className="eyebrow" style={{ marginBottom: 18 }}>
              Próximamente
            </div>
            <ComingSoon />
          </div>
        </div>

        {/* Features */}
        <div id="feat-anchor" />
        <div className="wrap section" style={{ paddingTop: 20 }}>
          <div className="rule" style={{ marginBottom: 54 }} />
          <div className="section-head" style={{ marginBottom: 30 }}>
            <div>
              <div className="eyebrow">La casa</div>
              <h2 style={{ marginTop: 12 }}>Hecho para jugar con confianza</h2>
            </div>
          </div>
          <div className="feat-grid">
            <div className="feat">
              <div className="fi">
                <Shield />
              </div>
              <div>
                <h4>Depósitos al instante</h4>
                <p>NowPayments, Binance, Pago Móvil, Daviplata y Nequi. Tu saldo, listo en segundos.</p>
              </div>
            </div>
            <div className="feat">
              <div className="fi">
                <WalletCoins />
              </div>
              <div>
                <h4>Doble moneda</h4>
                <p>Apuesta y retira en bolívares o dólares. Tú eliges la mesa.</p>
              </div>
            </div>
            <div className="feat">
              <div className="fi">
                <Chat />
              </div>
              <div>
                <h4>Soporte 24/7</h4>
                <p>Equipo real, atención por chat a cualquier hora del día.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="footer">
          <div className="wrap footer-inner">
            <div>
              <div className="brand" style={{ marginBottom: 10 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.png" alt="BetmarPlay" className="brand-logo" style={{ height: 48 }} />
              </div>
              <p className="muted">
                © 2026 BetmarPlay. Juega responsablemente. Prohibido para menores de
                +18 años.
              </p>
            </div>
            <div className="footer-pay">
              <span>Pagos:</span>
              <span className="pay-pill">NowPayments</span>
              <span className="pay-pill">Binance</span>
              <span className="pay-pill">Pago Móvil</span>
              <span className="pay-pill">Daviplata</span>
              <span className="pay-pill">Nequi</span>
              <span className="age" style={{ fontSize: 10, width: 26, height: 26 }}>
                +18
              </span>
            </div>
          </div>
        </footer>
      </section>
    </>
  );
}
