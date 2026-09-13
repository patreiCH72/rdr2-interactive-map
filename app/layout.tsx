import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="de-CH"
      className={`${cinzel.variable} ${sourceSans.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full overflow-hidden">{children}</body>
    </html>
  );
}
