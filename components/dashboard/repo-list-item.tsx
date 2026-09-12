"use client";

import { useState } from "react";
import { cn, formatRelativeTime } from "@/lib/utils";
import { repoKey } from "./types";
import type { TrackedRepo } from "./types";

export function RepoListItem({
  repo, selected, unreadCount, onSelect, onRemove,
}: {
  repo: TrackedRepo;
  selected: boolean;
  unreadCount: number;
  onSelect: () => void;
  onRemove: () => Promise<boolean>;
}) {
  const [confirming, setConfirming] = useState(false);
  const [removing, setRemoving] = useState(false);
  const label = repoKey(repo.owner, repo.name);

  async function remove() {
    setRemoving(true);
    const removed = await onRemove();
    setRemoving(false);
    if (!removed) setConfirming(false);
  }

  if (confirming) {
    return (
      <li className="border border-danger/20 bg-danger/5 p-3">
        <p className="truncate text-xs text-secondary">Stop tracking {label}?</p>
        <div className="mt-2 flex gap-2">
          <button type="button" onClick={remove} disabled={removing} className="text-xs font-medium text-danger hover:underline">
            {removing ? "Removing…" : "Remove"}
          </button>
          <button type="button" onClick={() => setConfirming(false)} className="text-xs text-muted hover:text-primary">
            Cancel
          </button>
        </div>
      </li>
    );
  }

  return (
    <li className="group relative">
      <button
        type="button"
        onClick={onSelect}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors",
          selected ? "bg-selected text-primary" : "text-secondary hover:bg-subtle hover:text-primary"
        )}
      >
        <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", repo.lastPolledAt ? "bg-success" : "bg-warning")} />
        <span className="min-w-0 flex-1">
          <span className="block truncate">{label}</span>
          <span className="mt-0.5 block truncate text-[11px] text-muted">
            {repo.lastPolledAt ? `Checked ${formatRelativeTime(repo.lastPolledAt)}` : "Waiting for first check"}
          </span>
        </span>
        {unreadCount > 0 ? (
          <span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold text-canvas">
            {unreadCount}
          </span>
        ) : null}
      </button>
      <button
        type="button"
        onClick={() => setConfirming(true)}
        aria-label={`Remove ${label}`}
        className="absolute right-2 top-2 hidden h-6 w-6 items-center justify-center text-muted hover:bg-danger/10 hover:text-danger group-hover:flex group-focus-within:flex"
      >
        ×
      </button>
    </li>
  );
}
