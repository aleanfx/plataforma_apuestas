"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";

import { SiteNav } from "@/components/site-nav";
import { WalletDialog } from "@/components/wallet-dialog";
import { AuthGuard } from "@/components/auth-guard";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { formatBs, formatUsd, initialOf } from "@/lib/money";
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
} from "@/components/icons";

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

function mapTx(e: LedgerDTO): Tx {
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
    amt: (pos ? "+ " : "− ") + formatBs(abs),
    usd: (pos ? "+" : "−") + formatUsd(abs),
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
  const { user, logout, updateAvatar } = useAuth();
  const router = useRouter();
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
      .then((r) => active && setTxs(r.transactions.map(mapTx)))
      .catch(() => active && setTxs([]));
    return () => {
      active = false;
    };
  }, []);

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
                <a>
                  <User /> Datos personales
                </a>
                <a>
                  <Shield /> Seguridad
                </a>
                <a>
                  <Cog /> Preferencias
                </a>
                <button type="button" className="danger" onClick={handleLogout}>
                  <Logout /> Cerrar sesión
                </button>
              </nav>
            </div>
          </aside>

          {/* right column */}
          <div>
            {/* balance feature */}
            <div className="balance-feature">
              <div className="k">Saldo total disponible</div>
              <div className="amount">{formatBs(total)}</div>
              <div className="usd-line">
                ≈ {formatUsd(total)} USD
                {(user?.bonus ?? 0) > 0 ? ` · incluye ${formatBs(user!.bonus)} de bono` : ""}
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
