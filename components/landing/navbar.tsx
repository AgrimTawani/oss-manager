"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { Logo } from "@/components/ui/logo";

export function LandingNavbar() {
  return (
    <header className="border-b border-border bg-canvas">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" aria-label="OSS Manager home"><Logo size="sm" /></Link>
        <div className="flex items-center gap-5">
          <a href="#how-it-works" className="hidden text-sm text-muted hover:text-primary sm:block">How it works</a>
          <a href="https://github.com/AgrimTawani/oss-manager" target="_blank" rel="noreferrer" className="hidden text-sm text-muted hover:text-primary sm:block">Source</a>
          <button type="button" onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="border border-border bg-panel px-3.5 py-2 text-sm font-medium text-primary hover:bg-subtle">
            Sign in with GitHub
          </button>
        </div>
      </nav>
    </header>
  );
}
