"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/ui/logo";
import { RepoListItem } from "./repo-list-item";
import type { FeedFilter, TrackedRepo } from "./types";

export function RepoSidebar({
  repos, loading, adding, formError, selectedRepoId, unreadByRepoId, unreadCount,
  feedFilter, username, avatarUrl, onSelectRepo, onClearSelection, onAddRepo,
  onRemoveRepo, onFeedFilterChange, onClose, className,
}: {
  repos: TrackedRepo[];
  loading: boolean;
  adding: boolean;
  formError: string | null;
  selectedRepoId: string | null;
  unreadByRepoId: Map<string, number>;
  unreadCount: number;
  feedFilter: FeedFilter;
  username?: string | null;
  avatarUrl?: string | null;
  onSelectRepo: (id: string | null) => void;
  onClearSelection: () => void;
  onAddRepo: (input: string) => Promise<boolean>;
  onRemoveRepo: (id: string) => Promise<boolean>;
  onFeedFilterChange: (filter: FeedFilter) => void;
  onClose?: () => void;
  className?: string;
}) {
  const [addingOpen, setAddingOpen] = useState(false);
  const [repoQuery, setRepoQuery] = useState("");
  const visibleRepos = useMemo(() => {
    const query = repoQuery.trim().toLowerCase();
    return query ? repos.filter((repo) => `${repo.owner}/${repo.name}`.toLowerCase().includes(query)) : repos;
  }, [repoQuery, repos]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const input = form.elements.namedItem("repo") as HTMLInputElement;
    if (await onAddRepo(input.value)) {
      form.reset();
      setAddingOpen(false);
    }
  }

  return (
    <aside className={cn("h-screen flex-col border-r border-border bg-sidebar", className)}>
      <div className="flex h-16 shrink-0 items-center justify-between border-b border-border px-4">
        <Logo size="sm" />
        {onClose ? <button type="button" onClick={onClose} className="h-8 w-8 text-xl text-muted hover:text-primary" aria-label="Close menu">×</button> : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <nav aria-label="Issue views" className="space-y-1">
          <button
            type="button"
            onClick={() => { onClearSelection(); onFeedFilterChange("all"); }}
            className={cn("flex w-full items-center justify-between px-3 py-2 text-sm", !selectedRepoId && feedFilter === "all" ? "bg-selected text-primary" : "text-secondary hover:bg-subtle")}
          >
            <span>All issues</span><span className="text-xs text-muted">{repos.length ? "Latest 100" : ""}</span>
          </button>
          <button
            type="button"
            onClick={() => { onClearSelection(); onFeedFilterChange("unread"); }}
            className={cn("flex w-full items-center justify-between px-3 py-2 text-sm", !selectedRepoId && feedFilter === "unread" ? "bg-selected text-primary" : "text-secondary hover:bg-subtle")}
          >
            <span>Unread</span><span className="min-w-5 rounded-full bg-primary px-1.5 py-0.5 text-center text-[10px] font-semibold text-canvas">{unreadCount}</span>
          </button>
        </nav>

        <div className="mt-7 flex items-center justify-between px-3">
          <h2 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted">Repositories</h2>
          <button type="button" onClick={() => setAddingOpen((open) => !open)} className="text-xs font-medium text-secondary hover:text-primary">
            {addingOpen ? "Cancel" : "+ Add"}
          </button>
        </div>

        {addingOpen ? (
          <form onSubmit={handleSubmit} className="mt-3 border border-border bg-panel p-3">
            <label htmlFor="repo-input" className="mb-2 block text-xs font-medium text-secondary">GitHub repository</label>
            <input id="repo-input" name="repo" required autoFocus placeholder="owner/repository" disabled={adding} className="h-9 w-full border border-border bg-canvas px-2.5 text-sm outline-none placeholder:text-muted focus:border-primary/30" />
            {formError ? <p className="mt-2 text-xs leading-relaxed text-danger">{formError}</p> : null}
            <button type="submit" disabled={adding} className="mt-3 h-8 w-full bg-primary text-xs font-semibold text-canvas hover:bg-primary/90 disabled:opacity-50">
              {adding ? "Adding…" : "Track repository"}
            </button>
          </form>
        ) : null}

        {repos.length > 5 ? (
          <input value={repoQuery} onChange={(event) => setRepoQuery(event.target.value)} placeholder="Filter repositories" aria-label="Filter repositories" className="mt-3 h-8 w-full border-b border-border bg-transparent px-3 text-xs outline-none placeholder:text-muted focus:border-primary/30" />
        ) : null}

        <div className="mt-3">
          {loading ? (
            <div className="space-y-1 px-3 py-2" aria-label="Loading repositories">
              {[1, 2, 3].map((item) => <div key={item} className="h-10 animate-pulse bg-subtle" />)}
            </div>
          ) : visibleRepos.length ? (
            <ul className="space-y-0.5">
              {visibleRepos.map((repo) => (
                <RepoListItem key={repo.id} repo={repo} selected={selectedRepoId === repo.id} unreadCount={unreadByRepoId.get(repo.id) ?? 0} onSelect={() => onSelectRepo(selectedRepoId === repo.id ? null : repo.id)} onRemove={() => onRemoveRepo(repo.id)} />
              ))}
            </ul>
          ) : (
            <p className="px-3 py-5 text-xs leading-relaxed text-muted">{repos.length ? "No repositories match." : "Add your first repository to start collecting issues."}</p>
          )}
        </div>
      </div>

      <div className="shrink-0 border-t border-border p-3">
        <div className="flex items-center gap-3 px-2 py-1.5">
          {avatarUrl ? <Image src={avatarUrl} alt="" width={28} height={28} className="h-7 w-7 rounded-full" /> : <span className="flex h-7 w-7 items-center justify-center rounded-full bg-subtle text-xs">{username?.charAt(0) ?? "U"}</span>}
          <span className="min-w-0 flex-1 truncate text-xs text-secondary">{username ?? "GitHub account"}</span>
          <button type="button" onClick={() => signOut({ callbackUrl: "/" })} className="text-xs text-muted hover:text-primary">Sign out</button>
        </div>
      </div>
    </aside>
  );
}
