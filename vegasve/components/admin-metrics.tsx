"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { formatBs } from "@/lib/money";
import { Coins, Users, Activity, CreditCard } from "@/components/icons";

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

export function AdminMetrics() {
  const [m, setM] = React.useState<Metrics | null>(null);

  React.useEffect(() => {
    const load = () => api<Metrics>("/admin/metrics").then(setM).catch(() => {});
    load();
    const t = setInterval(load, 10000); // refresca cada 10s
    return () => clearInterval(t);
  }, []);

  const stats = [
    { Icon: Coins, k: "Saldo en circulación", v: m ? formatBs(m.balanceTotal) : "…", sub: m ? `Depósitos: ${formatBs(m.depositsTotal)}` : "" },
    { Icon: Users, k: "Usuarios", v: m ? String(m.users) : "…", sub: m ? `${m.online} en línea` : "" },
    { Icon: Activity, k: "Mesas activas", v: m ? String(m.tables) : "…", sub: "Bingo · Dominó · Póker" },
    { Icon: CreditCard, k: "Pendientes", v: m ? String(m.pendingDeposits + m.pendingWithdrawals) : "…", sub: m ? `${m.pendingDeposits} dep · ${m.pendingWithdrawals} ret` : "" },
  ];

  return (
    <div className="stat-grid">
      {stats.map((s) => (
        <div className="stat" key={s.k}>
          <div className="si"><s.Icon /></div>
          <div className="k">{s.k}</div>
          <div className="v">{s.v}</div>
          <div className="delta up">{s.sub}</div>
        </div>
      ))}
    </div>
  );
}
