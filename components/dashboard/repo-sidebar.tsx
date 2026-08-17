"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { RepoListItem } from "./repo-list-item";
import { DashboardEmptyState } from "./dashboard-empty-state";
import type { TrackedRepo } from "./types";

export function RepoSidebar({
  repos,
  loading,
  adding,
  formError,
  selectedRepoId,
  unreadByRepoId,
  onSelectRepo,
  onClearSelection,
  onAddRepo,
  onRemoveRepo,
  className,
}: {
  repos: TrackedRepo[];
  loading: boolean;
  adding: boolean;
  formError: string | null;
  selectedRepoId: string | null;
  unreadByRepoId: Map<string, number>;
  onSelectRepo: (id: string | null) => void;
  onClearSelection: () => void;
  onAddRepo: (input: string) => Promise<boolean>;
  onRemoveRepo: (id: string) => void;
  className?: string;
}) {
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const input = form.elements.namedItem("repo") as HTMLInputElement;
    const ok = await onAddRepo(input.value);
    if (ok) {
      input.value = "";
      form.reset();
    }
  }

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col rounded-[1.5rem] border border-white/10 bg-[#0c0d14]/70 p-1.5 backdrop-blur-sm",
        className
      )}
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-[calc(1.5rem-0.375rem)] border border-white/[0.04] bg-[#10111a]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="border-b border-white/[0.06] p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-ink/40">
                Sources
              </p>
              <p className="mt-1 text-sm font-medium text-ink">{repos.length} tracked</p>
            </div>
            <button
              type="button"
              onClick={onClearSelection}
              className={cn(
                "rounded-full px-3 py-1 text-[10px] uppercase tracking-wider transition-colors",
                selectedRepoId
                  ? "bg-accent/15 text-accent hover:bg-accent/25"
                  : "text-ink/30"
              )}
            >
              All
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 flex gap-2">
            <input
              name="repo"
              placeholder="owner/name"
              disabled={adding}
              className="min-w-0 flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm text-ink placeholder:text-ink/30 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
            />
            <button
              type="submit"
              disabled={adding}
              className="shrink-0 rounded-xl bg-accent px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
            >
              {adding ? "…" : "Add"}
            </button>
          </form>
          {formError && (
            <p className="mt-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-300">
              {formError}
            </p>
          )}
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {loading ? (
            <ul className="space-y-2">
              {[1, 2, 3].map((i) => (
                <li
                  key={i}
                  className="h-[4.5rem] animate-pulse rounded-xl border border-white/[0.04] bg-white/[0.02]"
                />
              ))}
            </ul>
          ) : repos.length === 0 ? (
            <DashboardEmptyState
              title="No sources yet"
              description="Add a GitHub repo above to start monitoring maintainer issues."
            />
          ) : (
            <motion.ul layout className="space-y-2">
              {repos.map((repo) => (
                <RepoListItem
                  key={repo.id}
                  repo={repo}
                  selected={selectedRepoId === repo.id}
                  unreadCount={unreadByRepoId.get(repo.id) ?? 0}
                  onSelect={() =>
                    onSelectRepo(selectedRepoId === repo.id ? null : repo.id)
                  }
                  onRemove={() => onRemoveRepo(repo.id)}
                />
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </aside>
  );
}
