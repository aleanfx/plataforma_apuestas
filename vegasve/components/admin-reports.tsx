"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";
import { Coins, ArrowDownLine, ArrowUpAlt, Users } from "@/components/icons";

type Metrics = {
  users: number;
  online: number;
  balanceTotal: number;
  depositsTotal: number;
  withdrawalsTotal: number;
  pendingDeposits: number;
  pendingWithdrawals: number;
  tables: number;
};

export function AdminReports() {
  const { fmt } = useCurrency();
  const [m, setM] = React.useState<Metrics | null>(null);

  React.useEffect(() => {
    const load = () => api<Metrics>("/admin/metrics").then(setM).catch(() => {});
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, []);

  const net = m ? m.depositsTotal - m.withdrawalsTotal : 0;
  const totalFlow = m ? m.depositsTotal + m.withdrawalsTotal : 0;
  const depPct = totalFlow > 0 ? Math.round((m!.depositsTotal / totalFlow) * 100) : 0;
  const wdPct = totalFlow > 0 ? 100 - depPct : 0;

  const cards = [
    { Icon: ArrowDownLine, k: "Depósitos aprobados", v: m ? fmt(m.depositsTotal) : "…" },
    { Icon: ArrowUpAlt, k: "Retiros aprobados", v: m ? fmt(m.withdrawalsTotal) : "…" },
    { Icon: Coins, k: "Balance neto (dep − ret)", v: m ? fmt(net) : "…" },
    { Icon: Users, k: "Usuarios registrados", v: m ? String(m.users) : "…" },
  ];

  return (
    <>
      <div className="stat-grid">
        {cards.map((c) => (
          <div className="stat" key={c.k}>
            <div className="si"><c.Icon /></div>
            <div className="k">{c.k}</div>
            <div className="v">{c.v}</div>
          </div>
        ))}
      </div>

      <div className="a-card" style={{ marginTop: 22 }}>
        <div className="a-card-head">
          <div>
            <h3 className="serif">Flujo de caja</h3>
            <div className="sub">Depósitos vs retiros (aprobados)</div>
          </div>
        </div>
        <div style={{ padding: 24 }}>
          <div className="rep-bar">
            <div className="rep-seg dep" style={{ width: `${depPct}%` }} />
            <div className="rep-seg wd" style={{ width: `${wdPct}%` }} />
          </div>
          <div className="rep-legend">
            <span><i className="rdot dep" /> Depósitos {depPct}% · {m ? fmt(m.depositsTotal) : "…"}</span>
            <span><i className="rdot wd" /> Retiros {wdPct}% · {m ? fmt(m.withdrawalsTotal) : "…"}</span>
          </div>
          <div className="rep-rows">
            <div><span>Saldo en circulación</span><strong className="gold">{m ? fmt(m.balanceTotal) : "…"}</strong></div>
            <div><span>Solicitudes pendientes</span><strong>{m ? m.pendingDeposits + m.pendingWithdrawals : "…"}</strong></div>
            <div><span>Usuarios en línea</span><strong>{m ? m.online : "…"}</strong></div>
            <div><span>Mesas activas</span><strong>{m ? m.tables : "…"}</strong></div>
          </div>
        </div>
      </div>
    </>
  );
}
