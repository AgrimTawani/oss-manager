"use client";

import { motion } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";
import { repoKey } from "./types";
import type { TrackedRepo } from "./types";

export function RepoListItem({
  repo,
  selected,
  unreadCount,
  onSelect,
  onRemove,
}: {
  repo: TrackedRepo;
  selected: boolean;
  unreadCount: number;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const neverPolled = !repo.lastPolledAt;

  return (
    <motion.li layout className="list-none">
      <div
        className={cn(
          "group relative flex items-center gap-3 rounded-xl border p-3 transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          selected
            ? "border-accent/30 bg-accent/[0.08] shadow-[0_0_0_1px_rgba(52,87,213,0.12)]"
            : "border-white/[0.06] bg-white/[0.02] hover:border-white/12 hover:bg-white/[0.04]"
        )}
      >
        <button
          type="button"
          onClick={onSelect}
          className="flex min-w-0 flex-1 items-start gap-3 text-left"
        >
          <span className="relative mt-1.5 flex h-2 w-2 shrink-0">
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                neverPolled ? "bg-amber-400 animate-pulse" : "bg-emerald-400/80"
              )}
            />
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-mono text-sm text-ink">
              {repoKey(repo.owner, repo.name)}
            </span>
            <span className="mt-0.5 block font-mono text-[10px] text-ink/40">
              {neverPolled
                ? "Awaiting first poll"
                : formatRelativeTime(repo.lastPolledAt!)}
            </span>
          </span>
          {unreadCount > 0 && (
            <span className="shrink-0 rounded-full bg-accent px-2 py-0.5 font-mono text-[10px] text-white">
              {unreadCount}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 rounded-lg px-2 py-1.5 text-[10px] uppercase tracking-wider text-ink/30 opacity-0 transition-all hover:bg-red-500/10 hover:text-red-300 group-hover:opacity-100"
          aria-label={`Remove ${repoKey(repo.owner, repo.name)}`}
        >
          Remove
        </button>
      </div>
    </motion.li>
  );
}
