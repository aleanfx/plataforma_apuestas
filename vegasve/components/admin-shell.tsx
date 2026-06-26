"use client";

import * as React from "react";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";
import { initialOf } from "@/lib/money";
import { AdminMetrics } from "@/components/admin-metrics";
import { AdminUsers } from "@/components/admin-users";
import { AdminQueue } from "@/components/admin-queue";
import { AdminTables } from "@/components/admin-tables";
import { AdminSettings } from "@/components/admin-settings";
import { AdminReports } from "@/components/admin-reports";
import {
  ShieldCheck,
  Search,
  Bell,
  Grid,
  Users,
  CreditCard,
  Gamepad,
  Activity,
  Cog,
  Logout,
} from "@/components/icons";

type Section = "dashboard" | "usuarios" | "transacciones" | "juegos" | "reportes" | "config";
type IconType = React.ComponentType<React.SVGProps<SVGSVGElement>>;

const TITLES: Record<Section, { h1: string; p: string }> = {
  dashboard: { h1: "Hola, Admin", p: "Resumen operativo de BetmarPlay en vivo" },
  usuarios: { h1: "Usuarios", p: "Gestiona cuentas, saldos y estados" },
  transacciones: { h1: "Transacciones", p: "Aprueba o rechaza depósitos y retiros" },
  juegos: { h1: "Juegos", p: "Mesas en vivo y su estado" },
  reportes: { h1: "Reportes", p: "Métricas financieras y de actividad" },
  config: { h1: "Configuración", p: "Tasas de cambio y depósitos mínimos" },
};

const GENERAL: { id: Section; label: string; Icon: IconType }[] = [
  { id: "dashboard", label: "Dashboard", Icon: Grid },
  { id: "usuarios", label: "Usuarios", Icon: Users },
  { id: "transacciones", label: "Transacciones", Icon: CreditCard },
  { id: "juegos", label: "Juegos", Icon: Gamepad },
];
const SISTEMA: { id: Section; label: string; Icon: IconType }[] = [
  { id: "reportes", label: "Reportes", Icon: Activity },
  { id: "config", label: "Configuración", Icon: Cog },
];

export function AdminShell() {
  const { user } = useAuth();
  const [section, setSection] = React.useState<Section>("dashboard");
  const [query, setQuery] = React.useState("");

  const title = TITLES[section];
  const firstName = user?.name?.split(" ")[0] ?? "Admin";

  return (
    <>
      {/* Top bar */}
      <nav className="nav">
        <div className="nav-inner">
          <Link href="/" className="brand">
            <div className="brand-mark">
              <ShieldCheck />
            </div>
            <div className="brand-name">
              Betmar<span className="ve">Play</span>
            </div>
          </Link>
          <span className="pill pending" style={{ marginLeft: 4 }}>
            Admin
          </span>
          <div className="nav-spacer" />
          <div className="nav-actions">
            <div className="input-wrap admin-search" style={{ width: 230 }}>
              <Search />
              <input
                className="plain"
                style={{ paddingLeft: 40, background: "var(--gray)", borderColor: "var(--line)", fontSize: 13 }}
                placeholder="Buscar usuario, correo…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setSection("usuarios");
                }}
              />
            </div>
            <button className="icon-btn" title="Notificaciones">
              <Bell />
            </button>
            <div className="avatar">{user ? initialOf(user.name) : "A"}</div>
          </div>
        </div>
      </nav>

      <div className="admin-wrap">
        {/* Sidebar */}
        <aside className="admin-side">
          <nav className="admin-nav">
            <div className="grp-label">General</div>
            {GENERAL.map((n) => (
              <a
                key={n.id}
                className={section === n.id ? "active" : ""}
                onClick={() => setSection(n.id)}
              >
                <n.Icon /> {n.label}
              </a>
            ))}
            <div className="grp-label">Sistema</div>
            {SISTEMA.map((n) => (
              <a
                key={n.id}
                className={section === n.id ? "active" : ""}
                onClick={() => setSection(n.id)}
              >
                <n.Icon /> {n.label}
              </a>
            ))}
            <Link href="/" style={{ marginTop: 8 }}>
              <Logout /> Volver al sitio
            </Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="admin-main">
          <div className="admin-head">
            <div>
              <div className="eyebrow">Panel de control</div>
              <h1 style={{ marginTop: 10 }}>{section === "dashboard" ? `Hola, ${firstName}` : title.h1}</h1>
              <p>{title.p}</p>
            </div>
          </div>

          {section === "dashboard" && (
            <>
              <AdminMetrics />
              <div className="admin-grid">
                <AdminQueue />
                <AdminTables />
              </div>
            </>
          )}
          {section === "usuarios" && <AdminUsers query={query} />}
          {section === "transacciones" && <AdminQueue />}
          {section === "juegos" && <AdminTables />}
          {section === "reportes" && <AdminReports />}
          {section === "config" && <AdminSettings />}
        </main>
      </div>
    </>
  );
}
