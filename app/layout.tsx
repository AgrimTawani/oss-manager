import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "OSS Contribution Manager",
  description:
    "Track open source repos and get notified only when maintainers or contributors open issues.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`dark ${GeistSans.variable} ${GeistMono.variable}`}
    >
      <body className="bg-canvas font-sans text-primary antialiased"><Providers>{children}</Providers></body>
    </html>
  );
}
