"use client";

import * as React from "react";
import { api } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";

type AdminTable = {
  id: string;
  game: "bingo" | "domino" | "poker";
  name: string;
  stake: number;
  players: number;
  maxPlayers: number;
  status: string;
};

const GAME_LABEL: Record<string, string> = { bingo: "Bingo", domino: "Dominó", poker: "Póker" };
const STATUS_LABEL: Record<string, string> = { waiting: "Esperando", playing: "En juego", finished: "Terminada" };

export function AdminTables() {
  const { fmt } = useCurrency();
  const [tables, setTables] = React.useState<AdminTable[] | null>(null);

  React.useEffect(() => {
    const load = () => api<{ tables: AdminTable[] }>("/admin/tables").then((r) => setTables(r.tables)).catch(() => setTables([]));
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="a-card" style={{ marginTop: 22 }}>
      <div className="a-card-head">
        <div>
          <h3 className="serif">Mesas en vivo</h3>
          <div className="sub">Estado de las salas de juego</div>
        </div>
      </div>
      <div className="table-scroll">
        <table className="adm">
          <thead>
            <tr>
              <th>Juego</th>
              <th>Mesa</th>
              <th>Apuesta</th>
              <th>Jugadores</th>
              <th style={{ textAlign: "right" }}>Estado</th>
            </tr>
          </thead>
          <tbody>
            {tables?.map((t) => (
              <tr key={t.id}>
                <td className="serif" style={{ fontSize: 15 }}>{GAME_LABEL[t.game] ?? t.game}</td>
                <td>{t.name}</td>
                <td>{fmt(t.stake)}</td>
                <td>{t.players}/{t.maxPlayers}</td>
                <td style={{ textAlign: "right" }}>
                  <span className={`pill dot ${t.status === "playing" ? "ok" : "pending"}`}>
                    {STATUS_LABEL[t.status] ?? t.status}
                  </span>
                </td>
              </tr>
            ))}
            {tables && tables.length === 0 && (
              <tr><td colSpan={5} style={{ color: "var(--text-2)", padding: 20 }}>No hay mesas activas.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
