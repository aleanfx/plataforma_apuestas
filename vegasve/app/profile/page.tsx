"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { WalletDialog } from "@/components/wallet-dialog";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { useCurrency } from "@/lib/currency-context";
import { api } from "@/lib/api";
import { initialOf } from "@/lib/money";
import { sfx } from "@/lib/sfx";
import {
  Grid,
  User,
  Shield,
  Cog,
  Logout,
  Check,
  Plus,
  ArrowUpLine,
  ArrowDownLine,
  ArrowUpAlt,
  Copy,
  Lock,
  Bell,
  WalletCoins,
} from "@/components/icons";

type Section = "cartera" | "datos" | "seguridad" | "preferencias";

type LedgerDTO = { id: string; type: string; delta: number; note: string | null; createdAt: string };

type Tx = {
  id: string;
  ic: "in" | "out" | "game";
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  title: string;
  sub: string;
  sign: "pos" | "neg";
  amt: string;
  usd: string;
};

// Etiqueta + estilo por tipo de movimiento del ledger.
const TYPE_LABEL: Record<string, string> = {
  deposit: "Depósito",
  withdraw: "Retiro",
  bet_stake: "Apuesta",
  bet_payout: "Premio",
  bonus: "Bono",
  adjust: "Ajuste",
};

function mapTx(e: LedgerDTO, fmt: (c: number) => string): Tx {
  const pos = e.delta >= 0;
  const abs = Math.abs(e.delta);
  const isGame = e.type === "bet_stake" || e.type === "bet_payout";
  const date = new Date(e.createdAt).toLocaleString("es-VE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
  return {
    id: e.id,
    ic: isGame ? "game" : pos ? "in" : "out",
    Icon: pos ? ArrowDownLine : ArrowUpAlt,
    title: e.note || TYPE_LABEL[e.type] || "Movimiento",
    sub: date,
    sign: pos ? "pos" : "neg",
    amt: (pos ? "+ " : "− ") + fmt(abs),
    usd: "",
  };
}

// Redimensiona la imagen elegida a un avatar cuadrado pequeño (data URL JPEG).
async function fileToAvatar(file: File): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("No se pudo leer la imagen"));
      i.src = url;
    });
    const size = 220;
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas no disponible");
    const min = Math.min(img.width, img.height);
    const sx = (img.width - min) / 2;
    const sy = (img.height - min) / 2;
    ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
    return canvas.toDataURL("image/jpeg", 0.82);
  } finally {
    URL.revokeObjectURL(url);
  }
}

function ProfileContent() {
  const { user, logout, updateAvatar, updateCurrency, changePassword } = useAuth();
  const { fmt, fmtEquiv } = useCurrency();
  const router = useRouter();
  const [section, setSection] = React.useState<Section>("cartera");

  // --- Seguridad: cambio de contraseña ---
  const [curPw, setCurPw] = React.useState("");
  const [newPw, setNewPw] = React.useState("");
  const [confPw, setConfPw] = React.useState("");
  const [showPw, setShowPw] = React.useState(false);
  const [savingPw, setSavingPw] = React.useState(false);

  // --- Preferencias: sonidos ---
  const [soundOn, setSoundOn] = React.useState(true);
  React.useEffect(() => {
    setSoundOn(!sfx.isMuted());
  }, []);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (savingPw) return;
    if (newPw.length < 8) {
      toast.error("La nueva contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (newPw !== confPw) {
      toast.error("Las contraseñas nuevas no coinciden.");
      return;
    }
    setSavingPw(true);
    try {
      await changePassword(curPw, newPw);
      toast.success("Contraseña actualizada con éxito.");
      setCurPw("");
      setNewPw("");
      setConfPw("");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo cambiar la contraseña.");
    } finally {
      setSavingPw(false);
    }
  }

  function copyPlain(value: string, label: string) {
    navigator.clipboard.writeText(value);
    toast.success(`${label} copiado`);
  }

  function toggleSound() {
    const muted = sfx.toggle();
    setSoundOn(!muted);
  }

  async function handleUpdateCurrency(code: string) {
    try {
      await updateCurrency(code);
      toast.success("Moneda de la cuenta actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la moneda");
    }
  }
  const [txs, setTxs] = React.useState<Tx[] | null>(null);
  const [filter, setFilter] = React.useState<"all" | "pagos" | "juegos">("all");
  const fileRef = React.useRef<HTMLInputElement>(null);
  const [savingAvatar, setSavingAvatar] = React.useState(false);

  async function onPickAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // permite re-elegir la misma foto
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Elige un archivo de imagen");
      return;
    }
    setSavingAvatar(true);
    try {
      const dataUrl = await fileToAvatar(file);
      await updateAvatar(dataUrl);
      toast.success("Foto de perfil actualizada");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "No se pudo actualizar la foto");
    } finally {
      setSavingAvatar(false);
    }
  }

  React.useEffect(() => {
    let active = true;
    api<{ transactions: LedgerDTO[] }>("/wallet/transactions")
      .then((r) => active && setTxs(r.transactions.map((e) => mapTx(e, fmt))))
      .catch(() => active && setTxs([]));
    return () => {
      active = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fmt]);

  async function handleLogout() {
    await logout();
    router.push("/");
  }

  const total = (user?.balance ?? 0) + (user?.bonus ?? 0);
  const handle = user ? "@" + user.email.split("@")[0] : "";

  return (
    <>
      <SiteNav variant="in" />

      <section className="view">
        <div className="wrap profile-wrap">
          {/* left column */}
          <aside>
            <div className="pcard profile-id">
              <button
                type="button"
                className="av-lg av-edit"
                onClick={() => fileRef.current?.click()}
                title="Cambiar foto de perfil"
                disabled={savingAvatar}
              >
                {user?.avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={user.avatarUrl} alt="Foto de perfil" />
                ) : user ? (
                  initialOf(user.name)
                ) : (
                  "·"
                )}
                <span className="av-cam">{savingAvatar ? "…" : "📷"}</span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" hidden onChange={onPickAvatar} />
              <div className="pname">{user?.name}</div>
              <div className="pmeta">{handle}</div>
              <div className="verified">
                <Check strokeWidth={2} /> Cuenta verificada
              </div>

              <div className="pstats">
                <div className="ps">
                  <div className="n">0</div>
                  <div className="l">Partidas</div>
                </div>
                <div className="ps">
                  <div className="n">—</div>
                  <div className="l">Victorias</div>
                </div>
              </div>

              <nav className="menu-list">
                <Link href="/lobby">
                  <Grid /> Volver al lobby
                </Link>
                <button
                  type="button"
                  className={section === "cartera" ? "active" : ""}
                  onClick={() => setSection("cartera")}
                >
                  <WalletCoins /> Mi cartera
                </button>
                <button
                  type="button"
                  className={section === "datos" ? "active" : ""}
                  onClick={() => setSection("datos")}
                >
                  <User /> Datos personales
                </button>
                <button
                  type="button"
                  className={section === "seguridad" ? "active" : ""}
                  onClick={() => setSection("seguridad")}
                >
                  <Shield /> Seguridad
                </button>
                <button
                  type="button"
                  className={section === "preferencias" ? "active" : ""}
                  onClick={() => setSection("preferencias")}
                >
                  <Cog /> Preferencias
                </button>
                <button type="button" className="danger" onClick={handleLogout}>
                  <Logout /> Cerrar sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* right column */}
          <div>
            {section === "cartera" && (
            <>
            {/* balance feature */}
            <div className="balance-feature">
              <div className="k">Saldo total disponible</div>
              <div className="amount">{fmt(total)}</div>
              <div className="usd-line">
                ≈ {fmtEquiv(total)}
                {(user?.bonus ?? 0) > 0 ? ` · incluye ${fmt(user!.bonus)} de bono` : ""}
              </div>
              <div className="bf-actions">
                <WalletDialog kind="deposit">
                  <button className="btn btn-gold">
                    <Plus strokeWidth={1.8} /> Depositar
                  </button>
                </WalletDialog>
                <WalletDialog kind="withdraw">
                  <button className="btn btn-green">
                    <ArrowUpLine strokeWidth={1.8} /> Retirar
                  </button>
                </WalletDialog>
              </div>
            </div>

            {/* history */}
            <div className="panel">
              <div className="panel-head">
                <h3 className="serif">Historial de movimientos</h3>
                <div className="filters">
                  <button className={filter === "all" ? "active" : ""} onClick={() => setFilter("all")}>Todo</button>
                  <button className={filter === "pagos" ? "active" : ""} onClick={() => setFilter("pagos")}>Pagos</button>
                  <button className={filter === "juegos" ? "active" : ""} onClick={() => setFilter("juegos")}>Juegos</button>
                </div>
              </div>

              {(() => {
                const shown =
                  txs?.filter((t) =>
                    filter === "all" ? true : filter === "juegos" ? t.ic === "game" : t.ic !== "game",
                  ) ?? null;
                return shown === null ? (
                  <div style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>
                    Cargando movimientos…
                  </div>
                ) : shown.length === 0 ? (
                  <div style={{ padding: 28, textAlign: "center", color: "var(--text-2)" }}>
                    {filter === "all"
                      ? "Aún no tienes movimientos. Haz tu primer depósito para empezar."
                      : "No hay movimientos en esta categoría."}
                  </div>
                ) : (
                  shown.map((t) => (
                  <div className="tx" key={t.id}>
                    <div className={`tx-ic ${t.ic}`}>
                      <t.Icon />
                    </div>
                    <div className="tx-main">
                      <div className="tx-title">{t.title}</div>
                      <div className="tx-sub">{t.sub}</div>
                    </div>
                    <div className={`tx-amt ${t.sign}`}>
                      {t.amt} <span className="sm">{t.usd}</span>
                    </div>
                  </div>
                  ))
                );
              })()}
            </div>
            </>
            )}

            {/* DATOS PERSONALES */}
            {section === "datos" && (
              <div className="panel">
                <div className="panel-head">
                  <h3 className="serif">Datos personales</h3>
                </div>
                <div className="pdata-list">
                  <div className="pdata-row">
                    <span className="pdata-k">Nombre</span>
                    <span className="pdata-v">{user?.name}</span>
                  </div>
                  <div className="pdata-row">
                    <span className="pdata-k">Correo</span>
                    <span className="pdata-v">
                      {user?.email}
                      <button
                        type="button"
                        className="pdata-copy"
                        title="Copiar correo"
                        onClick={() => copyPlain(user?.email ?? "", "Correo")}
                      >
                        <Copy />
                      </button>
                    </span>
                  </div>
                  <div className="pdata-row">
                    <span className="pdata-k">ID de cuenta</span>
                    <span className="pdata-v mono">
                      {user?.id}
                      <button
                        type="button"
                        className="pdata-copy"
                        title="Copiar ID"
                        onClick={() => copyPlain(user?.id ?? "", "ID")}
                      >
                        <Copy />
                      </button>
                    </span>
                  </div>
                  <div className="pdata-row">
                    <span className="pdata-k">Usuario</span>
                    <span className="pdata-v">{handle}</span>
                  </div>
                  <div className="pdata-row">
                    <span className="pdata-k">Moneda</span>
                    <span className="pdata-v">
                      {user?.currency === "VES"
                        ? "🇻🇪 Bolívares (VES)"
                        : user?.currency === "COP"
                          ? "🇨🇴 Pesos Colombianos (COP)"
                          : "🇺🇸 Dólares (USD)"}
                    </span>
                  </div>
                  <div className="pdata-row">
                    <span className="pdata-k">Estado</span>
                    <span className="pdata-v">
                      <span className="verified-pill">
                        <Check strokeWidth={2.5} /> Verificada
                      </span>
                    </span>
                  </div>
                </div>
                <p className="pdata-note">
                  Para cambiar tu nombre o correo, escríbenos a soporte.
                </p>
              </div>
            )}

            {/* SEGURIDAD */}
            {section === "seguridad" && (
              <div className="panel">
                <div className="panel-head">
                  <h3 className="serif">Seguridad</h3>
                </div>
                <form className="sec-form" onSubmit={handleChangePassword}>
                  <div className="field">
                    <label>Contraseña actual</label>
                    <div className="input-wrap">
                      <Lock />
                      <input
                        type={showPw ? "text" : "password"}
                        value={curPw}
                        onChange={(e) => setCurPw(e.target.value)}
                        placeholder="••••••••"
                        autoComplete="current-password"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Nueva contraseña</label>
                    <div className="input-wrap">
                      <Lock />
                      <input
                        type={showPw ? "text" : "password"}
                        value={newPw}
                        onChange={(e) => setNewPw(e.target.value)}
                        placeholder="Mínimo 8 caracteres"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label>Confirmar nueva contraseña</label>
                    <div className="input-wrap">
                      <Lock />
                      <input
                        type={showPw ? "text" : "password"}
                        value={confPw}
                        onChange={(e) => setConfPw(e.target.value)}
                        placeholder="Repite la nueva contraseña"
                        autoComplete="new-password"
                      />
                    </div>
                  </div>
                  <label className="sec-show">
                    <input
                      type="checkbox"
                      checked={showPw}
                      onChange={(e) => setShowPw(e.target.checked)}
                    />
                    Mostrar contraseñas
                  </label>
                  <button className="btn btn-gold btn-block" type="submit" disabled={savingPw}>
                    {savingPw ? "Guardando…" : "Actualizar contraseña"}
                  </button>
                </form>
              </div>
            )}

            {/* PREFERENCIAS */}
            {section === "preferencias" && (
              <div className="panel">
                <div className="panel-head">
                  <h3 className="serif">Preferencias</h3>
                </div>

                <div className="pref-group">
                  <div className="pref-title">
                    <Cog /> Moneda de la cuenta
                  </div>
                  <p className="pref-desc">
                    Define la moneda nativa en la que ves e ingresas tus fondos.
                  </p>
                  <div className="pref-currencies">
                    {[
                      { code: "USD", label: "🇺🇸 Dólares (USD)" },
                      { code: "VES", label: "🇻🇪 Bolívares (VES)" },
                      { code: "COP", label: "🇨🇴 Pesos Colombianos (COP)" },
                    ].map((opt) => {
                      const on = user?.currency === opt.code;
                      return (
                        <button
                          key={opt.code}
                          className={`pref-cur${on ? " on" : ""}`}
                          onClick={() => handleUpdateCurrency(opt.code)}
                        >
                          <span>{opt.label}</span>
                          {on && <Check strokeWidth={2.5} />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="pref-group">
                  <div className="pref-title">
                    <Bell /> Sonidos del juego
                  </div>
                  <p className="pref-desc">
                    Efectos de sonido en bingo, dominó y póker.
                  </p>
                  <button
                    type="button"
                    className={`pref-toggle${soundOn ? " on" : ""}`}
                    onClick={toggleSound}
                  >
                    <span className="pref-toggle-k">
                      {soundOn ? "Activados" : "Silenciados"}
                    </span>
                    <span className="pref-switch">
                      <span className="knob" />
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
