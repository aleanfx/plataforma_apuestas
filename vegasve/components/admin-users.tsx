"use client";

import * as React from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { useCurrency } from "@/lib/currency-context";
import { initialOf } from "@/lib/money";
import { Shield, Check } from "@/components/icons";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  status: "active" | "suspended";
  balance: number;
};

export function AdminUsers() {
  const { fmt } = useCurrency();
  const [users, setUsers] = React.useState<AdminUser[] | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const load = React.useCallback(() => {
    api<{ users: AdminUser[] }>("/admin/users").then((r) => setUsers(r.users)).catch(() => setUsers([]));
  }, []);
  React.useEffect(() => load(), [load]);

  async function setStatus(u: AdminUser, status: "active" | "suspended") {
    setBusy(u.id);
    try {
      await api(`/admin/users/${u.id}/status`, { method: "POST", body: { status } });
      toast.success(status === "suspended" ? `${u.name} suspendido` : `${u.name} reactivado`);
      setUsers((prev) => prev?.map((x) => (x.id === u.id ? { ...x, status } : x)) ?? null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cambiar el estado");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="a-card">
      <div className="a-card-head">
        <div>
          <h3 className="serif">Usuarios</h3>
          <div className="sub">{users ? `${users.length} registrados` : "Cargando…"}</div>
        </div>
      </div>
      <div className="table-scroll">
        <table className="adm">
          <thead>
            <tr>
              <th>Usuario</th>
              <th>Estado</th>
              <th>Saldo</th>
              <th style={{ textAlign: "right" }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users?.map((u) => (
              <tr key={u.id}>
                <td>
                  <div className="u-cell">
                    <div className="av-sm">{initialOf(u.name)}</div>
                    <div>
                      <div className="nm">{u.name}{u.role === "admin" ? " · admin" : ""}</div>
                      <div className="em">{u.email}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`pill dot ${u.status === "active" ? "ok" : "banned"}`}>
                    {u.status === "active" ? "Activo" : "Suspendido"}
                  </span>
                </td>
                <td className="gold serif" style={{ fontSize: 15 }}>{fmt(u.balance)}</td>
                <td>
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    {u.role === "admin" ? (
                      <span style={{ color: "var(--text-3)", fontSize: 12 }}>—</span>
                    ) : (
                      <div className="act-row">
                        {u.status === "active" ? (
                          <button className="icon-btn reject" title="Suspender" disabled={busy === u.id} onClick={() => setStatus(u, "suspended")}>
                            <Shield />
                          </button>
                        ) : (
                          <button className="icon-btn approve" title="Reactivar" disabled={busy === u.id} onClick={() => setStatus(u, "active")}>
                            <Check strokeWidth={2} />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {users && users.length === 0 && (
              <tr><td colSpan={4} style={{ color: "var(--text-2)", padding: 20 }}>Sin usuarios aún.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
