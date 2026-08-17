import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Instrument_Serif } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-instrument-serif",
});

export const metadata: Metadata = {
  title: "OSS Contribution Manager",
  description:
    "Track open source repos and get notified only when maintainers or contributors open issues.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable} ${instrumentSerif.variable}`}
    >
      <body className="font-sans antialiased bg-paper text-ink">
        <div className="noise-overlay" aria-hidden="true" />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
