"use client";

import Link from "next/link";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import type { FeedFilter } from "./types";

export function CommandBar({
  reposCount,
  unreadCount,
  feedFilter,
  onFeedFilterChange,
  searchQuery,
  onSearchChange,
  onOpenRepos,
  username,
  avatarUrl,
}: {
  reposCount: number;
  unreadCount: number;
  feedFilter: FeedFilter;
  onFeedFilterChange: (filter: FeedFilter) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenRepos: () => void;
  username?: string | null;
  avatarUrl?: string | null;
}) {
  return (
    <header className="pointer-events-none relative z-40 px-4 pt-4 lg:px-6">
      <div className="pointer-events-auto mx-auto flex max-w-[1600px] flex-wrap items-center gap-3 rounded-full border border-white/10 bg-[#0c0d14]/75 px-3 py-2.5 shadow-[0_8px_40px_rgba(0,0,0,0.35)] backdrop-blur-xl sm:gap-4 sm:px-4">
        <Link href="/dashboard" className="shrink-0 transition-opacity hover:opacity-80">
          <Logo size="sm" showWordmark={false} />
        </Link>

        <div className="hidden min-w-0 flex-1 lg:block">
          <input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search issues, repos, authors…"
            className="w-full rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-sm text-ink placeholder:text-ink/35 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/50 sm:inline">
            {reposCount} tracked
          </span>
          <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/50">
            {unreadCount} unread
          </span>
          <span className="hidden rounded-full border border-white/10 bg-white/[0.03] px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-ink/40 xl:inline">
            Poll 15m
          </span>
        </div>

        <div className="flex rounded-full border border-white/10 bg-white/[0.02] p-0.5">
          {(["all", "unread"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onFeedFilterChange(tab)}
              className={cn(
                "rounded-full px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider transition-all duration-300",
                feedFilter === tab
                  ? "bg-accent text-white"
                  : "text-ink/45 hover:text-ink/70"
              )}
            >
              {tab}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onOpenRepos}
          className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-medium uppercase tracking-wider text-ink/55 transition-colors hover:border-white/20 hover:text-ink lg:hidden"
        >
          Repos ({reposCount})
        </button>

        <div className="ml-auto flex items-center gap-2 sm:ml-0">
          {username && (
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] py-1 pl-1 pr-3 sm:flex">
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
              <span className="max-w-[100px] truncate font-mono text-[10px] text-ink/55">
                {username}
              </span>
            </div>
          )}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] uppercase tracking-wider text-ink/50 transition-colors hover:border-white/20 hover:text-ink"
          >
            Sign out
          </button>
        </div>
      </div>

      <div className="pointer-events-auto mx-auto mt-3 max-w-[1600px] lg:hidden">
        <input
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search issues, repos, authors…"
          className="w-full rounded-full border border-white/10 bg-[#0c0d14]/75 px-4 py-2.5 text-sm text-ink placeholder:text-ink/35 backdrop-blur-xl focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
        />
      </div>
    </header>
  );
}
