const ITEMS = [
  { nm: "Luisa P.", action: "ganó", amt: "Bs. 4.500", tail: "en Dominó" },
  { nm: "Carlos R.", action: "retiró", amt: "Bs. 12.000", tail: "vía Binance" },
  { nm: "María D.", action: "ganó", amt: "Bs. 80.000", tail: "· Torneo Noche VE" },
  { nm: "José M.", action: "ganó", amt: "Bs. 2.300", tail: "en Póker" },
  { nm: "Ana G.", action: "reclamó bono", amt: "Bs. 1.500", tail: "de bienvenida" },
  { nm: "Pedro L.", action: "ganó", amt: "Bs. 6.700", tail: "en Dominó" },
  { nm: "Daniela S.", action: "retiró", amt: "Bs. 9.200", tail: "vía Pago Móvil" },
];

function Row() {
  return (
    <>
      {ITEMS.map((it, i) => (
        <span className="ticker-item" key={i}>
          <span className="t-dot" />
          <span className="nm">{it.nm}</span> {it.action}{" "}
          <span className="amt">{it.amt}</span> {it.tail}
        </span>
      ))}
    </>
  );
}

export function Ticker() {
  return (
    <div className="ticker">
      <span className="ticker-label">
        <span className="live-dot" /> En vivo
      </span>
      <div className="ticker-viewport">
        <div className="ticker-track" aria-hidden>
          <Row />
          <Row />
        </div>
      </div>
    </div>
  );
}
