import type { Metadata } from "next";
import { Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://bondmark.vercel.app"),
  title: {
    default: "Bondmark — check what a seller has to lose",
    template: "%s · Bondmark",
  },
  description:
    "Sellers lock a refund deposit on Solana. Buyers check the amount, how long it has been held, and every claim ever filed, before transferring anything.",
  openGraph: {
    title: "Bondmark — check what a seller has to lose",
    description:
      "A refund deposit held in a Solana program, visible to anyone, slashable when a claim holds up.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${instrumentSerif.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">{children}</body>
    </html>
  );
}
