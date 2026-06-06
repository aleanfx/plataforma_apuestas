const PAYMENTS = ["Criptomonedas", "Binance", "Pago Móvil", "Daviplata", "Nequi"];

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <div className="footer-brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="BetmarPlay" className="footer-logo" />
          <p className="muted">
            © 2026 BetmarPlay. Juega responsablemente. Prohibido para menores de
            +18 años.
          </p>
        </div>
        <div className="footer-pay">
          <span className="pay-lead">Pagos:</span>
          <div className="pay-viewport">
            <div className="pay-track">
              <span className="pay-group">
                {PAYMENTS.map((p) => (
                  <span className="pay-pill" key={p}>
                    {p}
                  </span>
                ))}
              </span>
              <span className="pay-group pay-dup" aria-hidden="true">
                {PAYMENTS.map((p) => (
                  <span className="pay-pill" key={p + "-dup"}>
                    {p}
                  </span>
                ))}
              </span>
            </div>
          </div>
          <span className="age" style={{ fontSize: 10, width: 26, height: 26 }}>
            +18
          </span>
        </div>
      </div>
    </footer>
  );
}
