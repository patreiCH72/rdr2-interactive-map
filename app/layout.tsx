import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Cinzel, Source_Sans_3 } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const sourceSans = Source_Sans_3({
  variable: "--font-source",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: "Red Dead Redemption 2 — Interactive Map",
  description:
    "Werbefreie, login-freie Fan-Karte. Demo-Datensatz, kein offizielles Rockstar-Produkt.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="de-CH"
      className={`${cinzel.variable} ${sourceSans.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
