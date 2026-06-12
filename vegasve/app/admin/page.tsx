import Link from "next/link";

import { AuthGuard } from "@/components/auth-guard";
import { AdminQueue } from "@/components/admin-queue";
import { AdminMetrics } from "@/components/admin-metrics";
import { AdminUsers } from "@/components/admin-users";
import { AdminTables } from "@/components/admin-tables";
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

export default function AdminPage() {
  return (
    <AuthGuard admin>
      {/* Admin top bar */}
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
            <div className="input-wrap" style={{ width: 230 }}>
              <Search />
              <input
                className="plain"
                style={{ paddingLeft: 40, background: "var(--gray)", borderColor: "var(--line)", fontSize: 13 }}
                placeholder="Buscar usuario, ID…"
              />
            </div>
            <button className="icon-btn" title="Notificaciones">
              <Bell />
            </button>
            <div className="avatar">A</div>
          </div>
        </div>
      </nav>

      <div className="admin-wrap">
        {/* Sidebar */}
        <aside className="admin-side">
          <nav className="admin-nav">
            <div className="grp-label">General</div>
            <a className="active"><Grid /> Dashboard</a>
            <a><Users /> Usuarios</a>
            <a><CreditCard /> Transacciones</a>
            <a><Gamepad /> Juegos</a>
            <div className="grp-label">Sistema</div>
            <a><Activity /> Reportes</a>
            <a><Cog /> Configuración</a>
            <Link href="/" style={{ marginTop: 8 }}><Logout /> Volver al sitio</Link>
          </nav>
        </aside>

        {/* Main */}
        <main className="admin-main">
          <div className="admin-head">
            <div>
              <div className="eyebrow">Panel de control</div>
              <h1 style={{ marginTop: 10 }}>Hola, Admin</h1>
              <p>Resumen operativo de BetmarPlay en vivo</p>
            </div>
          </div>

          {/* Métricas reales */}
          <AdminMetrics />

          {/* Usuarios + cola de aprobaciones */}
          <div className="admin-grid">
            <AdminUsers />
            <AdminQueue />
          </div>

          {/* Mesas en vivo */}
          <AdminTables />
        </main>
      </div>
    </AuthGuard>
  );
}
