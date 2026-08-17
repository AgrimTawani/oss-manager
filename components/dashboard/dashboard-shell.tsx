"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { Logo } from "@/components/ui/logo";
import { PageBackground } from "@/components/ui/page-background";

export function DashboardShell({
  children,
  username,
  avatarUrl,
}: {
  children: React.ReactNode;
  username?: string | null;
  avatarUrl?: string | null;
}) {
  return (
    <div className="relative min-h-[100dvh]">
      <PageBackground />

      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[#0c0d14]/60 backdrop-blur-xl">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="transition-opacity hover:opacity-80">
            <Logo size="sm" />
          </Link>

          <div className="flex items-center gap-3 sm:gap-4">
            {username && (
              <div className="flex items-center gap-2.5 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarUrl}
                    alt=""
                    className="h-7 w-7 rounded-full border border-white/10"
                  />
                ) : (
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/20 text-xs font-medium text-accent">
                    {username.charAt(0).toUpperCase()}
                  </div>
                )}
                <span className="hidden max-w-[140px] truncate font-mono text-xs text-ink/60 sm:inline">
                  {username}
                </span>
              </div>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-ink/55 transition-colors hover:border-white/20 hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="relative">{children}</main>
    </div>
  );
}
