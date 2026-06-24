import * as React from "react";

type P = React.SVGProps<SVGSVGElement>;

/** Outline icon base: thin linear style matching the prototype. */
function Outline({ children, ...props }: P & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  );
}

/* ---- Brand / trust ---- */
export const ShieldCheck = (p: P) => (
  <Outline {...p}>
    <path d="M12 2 4 7v5c0 5 3.4 8 8 10 4.6-2 8-5 8-10V7l-8-5Z" />
    <path d="m9 12 2 2 4-4" />
  </Outline>
);
export const Shield = (p: P) => (
  <Outline {...p}>
    <path d="M12 2 4 7v5c0 5 3.4 8 8 10 4.6-2 8-5 8-10V7l-8-5Z" />
  </Outline>
);
export const Clock = (p: P) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </Outline>
);
export const Check = (p: P) => (
  <Outline {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Outline>
);
export const ArrowRight = (p: P) => (
  <Outline {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Outline>
);
export const Plus = (p: P) => (
  <Outline {...p}>
    <path d="M12 5v14M5 12h14" />
  </Outline>
);
export const Close = (p: P) => (
  <Outline {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Outline>
);

/* ---- Suits (filled) ---- */
export const Spade = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 2c3 5 8 7 8 11a5 5 0 0 1-7 4l1 5h-4l1-5a5 5 0 0 1-7-4c0-4 5-6 8-11Z" />
  </svg>
);
export const Heart = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M12 21C12 21 3.5 14.4 3.5 8.6C3.5 5.7 5.7 4 8 4C9.8 4 11.2 5.1 12 6.3C12.8 5.1 14.2 4 16 4C18.3 4 20.5 5.7 20.5 8.6C20.5 14.4 12 21 12 21Z" />
  </svg>
);

/* ---- Games ---- */
export const DominoIcon = (p: P) => (
  <Outline {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="12" x2="20" y2="12" />
    <circle cx="9" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="9" cy="16" r="1" fill="currentColor" stroke="none" />
    <circle cx="12" cy="16.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="15" cy="16" r="1" fill="currentColor" stroke="none" />
  </Outline>
);
export const PokerIcon = (p: P) => (
  <Outline {...p}>
    <rect x="3" y="5" width="13" height="16" rx="2" />
    <path d="M16 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2" />
    <path
      d="M9.5 16c-2-1-3-2.5-3-4.2C6.5 10.2 7.4 9.5 8.3 9.5c.6 0 1 .4 1.2.9.2-.5.6-.9 1.2-.9.9 0 1.8.7 1.8 2.3 0 1.7-1 3.2-3 4.2Z"
      fill="currentColor"
      stroke="none"
    />
  </Outline>
);
export const DominoSimple = (p: P) => (
  <Outline {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <line x1="4" y1="12" x2="20" y2="12" />
  </Outline>
);
export const PokerSimple = (p: P) => (
  <Outline {...p}>
    <rect x="3" y="5" width="13" height="16" rx="2" />
    <path d="M16 8h3a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-9a2 2 0 0 1-2-2" />
  </Outline>
);
export const Roulette = (p: P) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
  </Outline>
);
export const Blackjack = (p: P) => (
  <Outline {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path
      d="M9 9.5c0-1 .8-1.5 1.5-1.5.5 0 .8.3 1 .7.2-.4.5-.7 1-.7.7 0 1.5.5 1.5 1.5 0 1.3-1.5 2.5-2.5 3-.9-.5-2.5-1.7-2.5-3Z"
      fill="currentColor"
      stroke="none"
    />
  </Outline>
);
export const Dice = (p: P) => (
  <Outline {...p}>
    <rect x="4" y="4" width="7" height="7" rx="1.5" />
    <rect x="13" y="4" width="7" height="7" rx="1.5" />
    <rect x="4" y="13" width="7" height="7" rx="1.5" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
    <circle cx="16.5" cy="7.5" r="1" fill="currentColor" stroke="none" />
  </Outline>
);
export const Slots = (p: P) => (
  <Outline {...p}>
    <path d="M7 4h10l-1 6a4 4 0 0 1-8 0L7 4Z" />
    <path d="M5 4h14M9 20h6M12 14v6" />
  </Outline>
);

/* ---- Features / wallet ---- */
export const WalletCoins = (p: P) => (
  <Outline {...p}>
    <path d="M4 7h16M4 7l1 12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2l1-12M9 11v6M15 11v6M9 7V5a3 3 0 0 1 6 0v2" />
  </Outline>
);
export const Chat = (p: P) => (
  <Outline {...p}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10Z" />
  </Outline>
);

/* ---- Money flow ---- */
export const ArrowDownLine = (p: P) => (
  <Outline {...p}>
    <path d="M12 19V5M5 12l7 7 7-7" />
  </Outline>
);
export const ArrowUpLine = (p: P) => (
  <Outline {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </Outline>
);
export const ArrowUpAlt = (p: P) => (
  <Outline {...p}>
    <path d="M12 5v14M5 12l7-7 7 7" />
  </Outline>
);

/* ---- Profile menu ---- */
export const Grid = (p: P) => (
  <Outline {...p}>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </Outline>
);
export const User = (p: P) => (
  <Outline {...p}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 20c0-3.3 3.6-6 8-6s8 2.7 8 6" />
  </Outline>
);
export const Cog = (p: P) => (
  <Outline {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19 12a7 7 0 0 0-.1-1l2-1.5-2-3.5-2.4 1a7 7 0 0 0-1.7-1l-.3-2.5h-4l-.3 2.5a7 7 0 0 0-1.7 1l-2.4-1-2 3.5 2 1.5a7 7 0 0 0 0 2l-2 1.5 2 3.5 2.4-1a7 7 0 0 0 1.7 1l.3 2.5h4l.3-2.5a7 7 0 0 0 1.7-1l2.4 1 2-3.5-2-1.5a7 7 0 0 0 .1-1Z" />
  </Outline>
);
export const Logout = (p: P) => (
  <Outline {...p}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
  </Outline>
);

/* ---- Form fields ---- */
export const Mail = (p: P) => (
  <Outline {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </Outline>
);
export const Lock = (p: P) => (
  <Outline {...p}>
    <rect x="4" y="11" width="16" height="10" rx="2" />
    <path d="M8 11V8a4 4 0 0 1 8 0v3" />
  </Outline>
);
export const CardAccount = (p: P) => (
  <Outline {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </Outline>
);
export const Google = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M21 12.2c0-.6-.1-1.2-.2-1.8H12v3.4h5c-.2 1.2-.9 2.2-1.9 2.9v2.4h3c1.8-1.7 2.9-4.1 2.9-6.9Z" />
    <path d="M12 21c2.6 0 4.7-.9 6.3-2.3l-3-2.4c-.8.6-1.9.9-3.3.9-2.5 0-4.7-1.7-5.4-4H3.4v2.5C5 19.9 8.3 21 12 21Z" />
    <path d="M6.6 13.2c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9V6.9H3.4C2.8 8.2 2.4 9.6 2.4 11.3s.4 3.1 1 4.4l3.2-2.5Z" />
    <path d="M12 5.4c1.4 0 2.7.5 3.7 1.4l2.7-2.7C16.7 2.6 14.6 1.7 12 1.7 8.3 1.7 5 3.5 3.4 6.9l3.2 2.5c.7-2.3 2.9-4 5.4-4Z" />
  </svg>
);
export const Facebook = (p: P) => (
  <svg viewBox="0 0 24 24" fill="currentColor" {...p}>
    <path d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.8c0-2.5 1.5-3.9 3.8-3.9 1.1 0 2.2.2 2.2.2v2.5h-1.3c-1.2 0-1.6.8-1.6 1.6V12h2.8l-.4 2.9h-2.4v7A10 10 0 0 0 22 12Z" />
  </svg>
);

/* ---- Admin ---- */
export const Coins = (p: P) => (
  <Outline {...p}>
    <ellipse cx="9" cy="6" rx="6" ry="3" />
    <path d="M3 6v6c0 1.7 2.7 3 6 3s6-1.3 6-3V6" />
    <path d="M3 12v6c0 1.7 2.7 3 6 3 1.2 0 2.3-.15 3.2-.4" />
    <circle cx="17" cy="15" r="4" />
  </Outline>
);
export const Users = (p: P) => (
  <Outline {...p}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M3 20c0-3 2.7-5 6-5s6 2 6 5" />
    <path d="M16 4.5a3.5 3.5 0 0 1 0 7M21 20c0-2.6-2-4.4-4.5-4.9" />
  </Outline>
);
export const Activity = (p: P) => (
  <Outline {...p}>
    <path d="M3 12h4l3 8 4-16 3 8h4" />
  </Outline>
);
export const TrendingUp = (p: P) => (
  <Outline {...p}>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M16 7h5v5" />
  </Outline>
);
export const TrendingDown = (p: P) => (
  <Outline {...p}>
    <path d="M3 7l6 6 4-4 8 8" />
    <path d="M16 17h5v-5" />
  </Outline>
);
export const Gamepad = (p: P) => (
  <Outline {...p}>
    <path d="M7 8h10a4 4 0 0 1 4 4v1a3 3 0 0 1-5.2 2L14 14h-4l-1.8 1A3 3 0 0 1 3 13v-1a4 4 0 0 1 4-4Z" />
    <path d="M7 11v2M6 12h2M15 11.5h.01M17.5 13h.01" />
  </Outline>
);
export const Bell = (p: P) => (
  <Outline {...p}>
    <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.7 21a2 2 0 0 1-3.4 0" />
  </Outline>
);
export const Search = (p: P) => (
  <Outline {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m21 21-4.3-4.3" />
  </Outline>
);
export const CreditCard = (p: P) => (
  <Outline {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M3 10h18" />
  </Outline>
);
export const Settings = Cog;

/* ---- Juego en vivo (reemplazan emojis) ---- */
export const Expand = (p: P) => (
  <Outline {...p}>
    <path d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3" />
  </Outline>
);
export const Compress = (p: P) => (
  <Outline {...p}>
    <path d="M3 8h3a2 2 0 0 0 2-2V3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M21 16h-3a2 2 0 0 0-2 2v3" />
  </Outline>
);
export const SoundOn = (p: P) => (
  <Outline {...p}>
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13" />
  </Outline>
);
export const SoundOff = (p: P) => (
  <Outline {...p}>
    <path d="M11 5 6 9H2v6h4l5 4z" />
    <path d="M22 9l-6 6M16 9l6 6" />
  </Outline>
);
export const Cpu = (p: P) => (
  <Outline {...p}>
    <rect x="6" y="6" width="12" height="12" rx="2" />
    <path d="M9 2v2M15 2v2M9 20v2M15 20v2M2 9h2M2 15h2M20 9h2M20 15h2M9.5 14.5h5" />
    <circle cx="10" cy="11" r="1" fill="currentColor" stroke="none" />
    <circle cx="14" cy="11" r="1" fill="currentColor" stroke="none" />
  </Outline>
);
export const Trophy = (p: P) => (
  <Outline {...p}>
    <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3" />
  </Outline>
);
export const Copy = (p: P) => (
  <Outline {...p}>
    <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
    <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
  </Outline>
);
