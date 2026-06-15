"use client";

import * as React from "react";
import Link from "next/link";

import { ShieldCheck, Plus } from "@/components/icons";
import { AuthDialog } from "@/components/auth-dialog";
import { WalletDialog } from "@/components/wallet-dialog";
import { useAuth } from "@/lib/auth-context";
import { formatBs, formatUsdShort, initialOf } from "@/lib/money";

// prueba estas rutas en orden; usa la primera que cargue
const LOGO_CANDIDATES = ["/logo.png", "/logo.webp", "/logo.jpeg", "/logo.jpg"];

function Brand({ href }: { href: string }) {
  const [idx, setIdx] = React.useState(0);
  const failed = idx >= LOGO_CANDIDATES.length;
  return (
    <Link href={href} className="brand">
      {!failed ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={LOGO_CANDIDATES[idx]}
          alt="BetmarPlay"
          className="brand-logo"
          onError={() => setIdx((i) => i + 1)}
        />
      ) : (
        <>
          <div className="brand-mark">
            <ShieldCheck />
          </div>
          <div className="brand-name">
            Betmar<span className="ve">Play</span>
          </div>
        </>
      )}
    </Link>
  );
}

export function SiteNav({ variant }: { variant: "out" | "in" }) {
  if (variant === "out") {
    return (
      <nav className="nav">
        <div className="nav-inner">
          <Brand href="/" />
          <div className="nav-links">
            <a href="#games-anchor">Juegos</a>
            <a href="#feat-anchor">Por qué BetmarPlay</a>
            <AuthDialog defaultTab="register">
              <a>Promociones</a>
            </AuthDialog>
          </div>
          <div className="nav-spacer" />
          <div className="nav-actions">
            <AuthDialog defaultTab="login">
              <button className="btn btn-ghost btn-sm">Ingresar</button>
            </AuthDialog>
            <AuthDialog defaultTab="register">
              <button className="btn btn-gold btn-sm">Registrarse</button>
            </AuthDialog>
          </div>
        </div>
      </nav>
    );
  }

  return <NavIn />;
}

function NavIn() {
  const { user } = useAuth();
  const total = user ? user.balance + user.bonus : 0;

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Brand href="/lobby" />
        <div className="nav-links">
          <Link href="/lobby">Inicio</Link>
        </div>
        <div className="nav-spacer" />
        <div className="nav-actions">
          <div className="balance-chip">
            <div className="bal">
              <span className="k">Saldo</span>
              <span className="v">{user ? formatBs(total) : "—"}</span>
            </div>
            <span className="usd">{user ? formatUsdShort(total) : ""}</span>
            <WalletDialog kind="deposit">
              <button className="chip-add" title="Depositar">
                <Plus strokeWidth={2} />
              </button>
            </WalletDialog>
          </div>
          <Link href="/profile" className="avatar">
            {user?.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.avatarUrl} alt="" />
            ) : user ? (
              initialOf(user.name)
            ) : (
              "·"
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
}
