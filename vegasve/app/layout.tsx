import type { Metadata } from "next";
import { Outfit, Jost, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth-context";
import { CurrencyProvider } from "@/lib/currency-context";
import { ServerWakeOverlay } from "@/components/server-wake-overlay";
import { SoundToggle } from "@/components/sound-toggle";

const display = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const sans = Jost({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-sans",
  display: "swap",
});

const script = Dancing_Script({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-script",
  display: "swap",
});

const SITE_URL = "https://plataforma-apuestas.vercel.app";
const DESCRIPTION =
  "Casino premium en Venezuela. Dominó, Póker, Bingo, Parley y Pollas Hípicas en vivo. Mesas en bolívares y dólares, depósitos y retiros al instante.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "BetmarPlay — Casino & Apuestas",
    template: "%s · BetmarPlay",
  },
  description: DESCRIPTION,
  applicationName: "BetmarPlay",
  keywords: ["casino", "apuestas", "Venezuela", "Dominó", "Póker", "Bingo", "Parley", "Pollas Hípicas"],
  openGraph: {
    type: "website",
    locale: "es_VE",
    url: SITE_URL,
    siteName: "BetmarPlay",
    title: "BetmarPlay — Casino & Apuestas",
    description: DESCRIPTION,
    images: [{ url: "/logo.png", width: 600, height: 476, alt: "BetmarPlay" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "BetmarPlay — Casino & Apuestas",
    description: DESCRIPTION,
    images: ["/logo.png"],
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="es"
      className={`${display.variable} ${sans.variable} ${script.variable}`}
    >
      <body>
        <AuthProvider><CurrencyProvider>{children}</CurrencyProvider></AuthProvider>
        <ServerWakeOverlay />
        <SoundToggle />
        <Toaster />
      </body>
    </html>
  );
}
