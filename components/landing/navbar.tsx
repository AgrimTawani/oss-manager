"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#features", label: "Features" },
];

export function LandingNavbar({ className }: { className?: string }) {
  return (
    <header className={cn("fixed inset-x-0 top-0 z-50 px-4 pt-4 lg:px-8", className)}>
      <nav className="mx-auto flex max-w-7xl items-center justify-between rounded-full border border-white/10 bg-[#0c0d14]/70 px-4 py-2.5 shadow-[0_8px_32px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:px-5">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Logo size="sm" />
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 text-sm text-ink/55 transition-colors duration-300 hover:bg-white/[0.04] hover:text-ink"
            >
              {link.label}
            </a>
          ))}
          <a
            href="https://github.com/AgrimTawani/oss-manager"
            target="_blank"
            rel="noreferrer"
            className="rounded-full px-4 py-2 text-sm text-ink/55 transition-colors duration-300 hover:bg-white/[0.04] hover:text-ink"
          >
            GitHub
          </a>
        </div>

        <button
          type="button"
          onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
          className="rounded-full bg-white px-4 py-2 text-sm font-medium text-[#07080f] transition-all duration-500 hover:bg-white/90 active:scale-[0.98] sm:px-5"
        >
          Sign in
        </button>
      </nav>
    </header>
  );
}
