import Link from "next/link";

import { QueueActions, UserRowActions } from "@/components/admin-actions";
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
  Coins,
  TrendingUp,
  TrendingDown,
  ArrowDownLine,
  ArrowUpAlt,
} from "@/components/icons";

const STATS = [
  { Icon: Coins, k: "Ingresos hoy", v: "Bs. 1,24M", delta: "+12,5% vs. ayer", dir: "up" as const },
  { Icon: Users, k: "Usuarios activos", v: "3.480", delta: "+5,2% esta semana", dir: "up" as const },
  { Icon: Activity, k: "Partidas hoy", v: "8.920", delta: "+8,1% vs. ayer", dir: "up" as const },
  { Icon: CreditCard, k: "Retiros pendientes", v: "14", delta: "+3 sin revisar", dir: "down" as const },
];

const USERS = [
  { in: "R", nm: "Rafael Méndez", em: "rafa@correo.com", st: "ok", stl: "Activo", bal: "Bs. 12.480" },
  { in: "L", nm: "Luisa Pérez", em: "luisa@correo.com", st: "ok", stl: "Activo", bal: "Bs. 3.200" },
  { in: "C", nm: "Carlos Gómez", em: "carlosg@correo.com", st: "pending", stl: "KYC pendiente", bal: "Bs. 0" },
  { in: "M", nm: "María Díaz", em: "mdiaz@correo.com", st: "ok", stl: "Activo", bal: "Bs. 8.750" },
  { in: "J", nm: "José Ramírez", em: "jramirez@correo.com", st: "banned", stl: "Suspendido", bal: "Bs. 540" },
];

const QUEUE = [
  { dir: "dep" as const, title: "Depósito · Binance Pay", sub: "Rafael Méndez · hace 2 min", amt: "Bs. 4.000" },
  { dir: "wd" as const, title: "Retiro · Pago Móvil", sub: "Luisa Pérez · hace 8 min", amt: "Bs. 2.000" },
  { dir: "dep" as const, title: "Depósito · NowPayments", sub: "María Díaz · hace 15 min", amt: "Bs. 10.000" },
  { dir: "wd" as const, title: "Retiro · Nequi", sub: "Carlos Gómez · hace 22 min", amt: "Bs. 1.500" },
];

const GAMES = [
  { nm: "Dominó", players: "1.240", stakes: "desde Bs. 50", st: "ok", stl: "Activo" },
  { nm: "Póker", players: "860", stakes: "desde Bs. 200", st: "ok", stl: "Activo" },
  { nm: "Ruleta", players: "—", stakes: "—", st: "pending", stl: "Próximamente" },
  { nm: "Blackjack", players: "—", stakes: "—", st: "pending", stl: "Próximamente" },
];

export default function AdminPage() {
  return (
    <>
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
            <div
              className="input-wrap"
              style={{ width: 230 }}
            >
              <Search />
              <input
                className="plain"
                style={{
                  paddingLeft: 40,
                  background: "var(--gray)",
                  borderColor: "var(--line)",
                  fontSize: 13,
                }}
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
            <a className="active">
              <Grid /> Dashboard
            </a>
            <a>
              <Users /> Usuarios
            </a>
            <a>
              <CreditCard /> Transacciones
            </a>
            <a>
              <Gamepad /> Juegos
            </a>
            <div className="grp-label">Sistema</div>
            <a>
              <Activity /> Reportes
            </a>
            <a>
              <Cog /> Configuración
            </a>
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
              <h1 style={{ marginTop: 10 }}>Buenas noches, Admin</h1>
              <p>Resumen operativo de BetmarPlay · hoy, 29 de mayo de 2026</p>
            </div>
            <button className="btn btn-ghost btn-sm">Exportar reporte</button>
          </div>

          {/* Stats */}
          <div className="stat-grid">
            {STATS.map((s) => (
              <div className="stat" key={s.k}>
                <div className="si">
                  <s.Icon />
                </div>
                <div className="k">{s.k}</div>
                <div className="v">{s.v}</div>
                <div className={`delta ${s.dir}`}>
                  {s.dir === "up" ? <TrendingUp /> : <TrendingDown />}
                  {s.delta}
                </div>
              </div>
            ))}
          </div>

          {/* Two columns: users + pending queue */}
          <div className="admin-grid">
            <div className="a-card">
              <div className="a-card-head">
                <div>
                  <h3 className="serif">Usuarios recientes</h3>
                  <div className="sub">Últimos registros y actividad</div>
                </div>
                <button className="btn btn-ghost btn-sm">Ver todos</button>
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
                  {USERS.map((u) => (
                    <tr key={u.em}>
                      <td>
                        <div className="u-cell">
                          <div className="av-sm">{u.in}</div>
                          <div>
                            <div className="nm">{u.nm}</div>
                            <div className="em">{u.em}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className={`pill dot ${u.st}`}>{u.stl}</span>
                      </td>
                      <td className="gold serif" style={{ fontSize: 15 }}>
                        {u.bal}
                      </td>
                      <td>
                        <div style={{ display: "flex", justifyContent: "flex-end" }}>
                          <UserRowActions name={u.nm} />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>

            <div className="a-card">
              <div className="a-card-head">
                <div>
                  <h3 className="serif">Solicitudes pendientes</h3>
                  <div className="sub">Aprueba o rechaza pagos</div>
                </div>
                <span className="pill pending">{QUEUE.length} en cola</span>
              </div>
              {QUEUE.map((q, i) => (
                <div className="q-item" key={i}>
                  <div className={`q-ic ${q.dir}`}>
                    {q.dir === "dep" ? <ArrowDownLine /> : <ArrowUpAlt />}
                  </div>
                  <div className="q-main">
                    <div className="q-title">{q.title}</div>
                    <div className="q-sub">{q.sub}</div>
                  </div>
                  <div className="q-amt">{q.amt}</div>
                  <QueueActions label={`${q.title} (${q.amt})`} />
                </div>
              ))}
            </div>
          </div>

          {/* Games table */}
          <div className="a-card" style={{ marginTop: 22 }}>
            <div className="a-card-head">
              <div>
                <h3 className="serif">Juegos</h3>
                <div className="sub">Estado de las mesas en la plataforma</div>
              </div>
              <button className="btn btn-ghost btn-sm">Añadir juego</button>
            </div>
            <div className="table-scroll">
            <table className="adm">
              <thead>
                <tr>
                  <th>Juego</th>
                  <th>Jugadores</th>
                  <th>Apuesta mínima</th>
                  <th style={{ textAlign: "right" }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {GAMES.map((g) => (
                  <tr key={g.nm}>
                    <td className="serif" style={{ fontSize: 16 }}>
                      {g.nm}
                    </td>
                    <td>{g.players}</td>
                    <td>{g.stakes}</td>
                    <td style={{ textAlign: "right" }}>
                      <span className={`pill dot ${g.st}`}>{g.stl}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
