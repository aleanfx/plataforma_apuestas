"use client";

import Link from "next/link";
import { toast } from "sonner";

import { ShieldCheck, Plus } from "@/components/icons";
import { AuthDialog } from "@/components/auth-dialog";
import { WalletDialog } from "@/components/wallet-dialog";

function Brand({ href }: { href: string }) {
  return (
    <Link href={href} className="brand">
      <div className="brand-mark">
        <ShieldCheck />
      </div>
      <div className="brand-name">
        Betmar<span className="ve">Play</span>
      </div>
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

  return (
    <nav className="nav">
      <div className="nav-inner">
        <Brand href="/lobby" />
        <div className="nav-links">
          <Link href="/lobby">Lobby</Link>
          <a onClick={() => toast("Abriendo mesas de Dominó…")}>Dominó</a>
          <a onClick={() => toast("Abriendo mesas de Póker…")}>Póker</a>
        </div>
        <div className="nav-spacer" />
        <div className="nav-actions">
          <div className="balance-chip">
            <div className="bal">
              <span className="k">Saldo</span>
              <span className="v">Bs. 12.480</span>
            </div>
            <span className="usd">$312</span>
            <WalletDialog kind="deposit">
              <button className="chip-add" title="Depositar">
                <Plus strokeWidth={2} />
              </button>
            </WalletDialog>
          </div>
          <Link href="/profile" className="avatar">
            R
          </Link>
        </div>
      </div>
    </nav>
  );
}
