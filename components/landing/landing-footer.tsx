"use client";

import { Logo } from "@/components/ui/logo";
import { signIn } from "next-auth/react";

export function LandingFooter() {
  return (
    <footer className="border-t border-line px-4 py-24 lg:px-8">
      <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-12 md:flex-row md:items-center">
        <div className="max-w-md">
          <Logo className="mb-6" />
          <h2 className="font-display text-2xl tracking-[-0.02em] text-ink md:text-3xl">
            Ready to track your next contribution?
          </h2>
          <p className="mt-3 text-sm text-ink/55">
            Sign in with GitHub and add your first repo in under a minute.
          </p>
          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="group mt-8 inline-flex items-center gap-3 rounded-full bg-white px-6 py-3 text-sm font-medium text-paper transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-white/90 active:scale-[0.98]"
          >
            Get started
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-paper/10 text-paper transition-transform duration-700 group-hover:translate-x-0.5 group-hover:-translate-y-px">
              ↗
            </span>
          </button>
        </div>

        <nav className="flex flex-col gap-3 font-mono text-xs text-ink/45">
          <a
            href="https://github.com/AgrimTawani/oss-manager"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink/70"
          >
            GitHub repo
          </a>
          <a href="/api/health" className="transition-colors hover:text-ink/70">
            Health check
          </a>
          <a
            href="https://oss-manager-black.vercel.app"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-ink/70"
          >
            Production app
          </a>
        </nav>
      </div>

      <p className="mx-auto mt-16 max-w-7xl font-mono text-[10px] uppercase tracking-[0.15em] text-ink/30">
        OSS Contribution Manager · MIT License
      </p>
    </footer>
  );
}
