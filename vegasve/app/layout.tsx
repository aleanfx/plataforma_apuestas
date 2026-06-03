import type { Metadata } from "next";
import { Outfit, Jost, Dancing_Script } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

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

export const metadata: Metadata = {
  title: "BetmarPlay — Casino & Apuestas",
  description:
    "Casino premium en Venezuela. Dominó y Póker en vivo, mesas en bolívares y dólares, depósitos y retiros al instante.",
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
        {children}
        <Toaster />
      </body>
    </html>
  );
}
