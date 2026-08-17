"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";

export function DashboardShell({
  children,
  username,
}: {
  children: React.ReactNode;
  username?: string | null;
}) {
  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-sm font-medium text-ink hover:text-ink/80">
            OSS Contribution Manager
          </Link>
          <div className="flex items-center gap-4">
            {username && (
              <span className="hidden font-mono text-xs text-ink/40 sm:inline">{username}</span>
            )}
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-xs text-ink/50 transition-colors hover:text-ink"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}
