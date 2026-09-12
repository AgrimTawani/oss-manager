"use client";

export function CommandBar({
  searchQuery, onSearchChange, onOpenRepos, onRefresh, refreshing, reposCount,
}: {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onOpenRepos: () => void;
  onRefresh: () => void;
  refreshing: boolean;
  reposCount: number;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-canvas/95 backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          onClick={onOpenRepos}
          className="inline-flex h-9 w-9 items-center justify-center border border-border text-secondary hover:bg-subtle hover:text-primary lg:hidden"
          aria-label={`Open repositories menu, ${reposCount} tracked`}
        >
          <span aria-hidden="true">☰</span>
        </button>

        <label className="relative min-w-0 max-w-xl flex-1">
          <span className="sr-only">Search issues, repositories, or authors</span>
          <svg aria-hidden="true" viewBox="0 0 20 20" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 fill-none stroke-muted" strokeWidth="1.8">
            <circle cx="8.5" cy="8.5" r="5.5" />
            <path d="m13 13 4 4" />
          </svg>
          <input
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search issues, repos, or authors"
            className="h-10 w-full border border-border bg-panel pl-10 pr-4 text-sm text-primary outline-none placeholder:text-muted focus:border-primary/30 focus:ring-2 focus:ring-primary/10"
          />
        </label>

        <button
          type="button"
          onClick={onRefresh}
          disabled={refreshing}
          className="inline-flex h-10 items-center gap-2 border border-border bg-panel px-3 text-sm font-medium text-secondary hover:bg-subtle hover:text-primary disabled:cursor-wait disabled:opacity-60"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" className={`h-4 w-4 fill-none stroke-current ${refreshing ? "animate-spin" : ""}`} strokeWidth="1.7">
            <path d="M16 7a6.5 6.5 0 1 0 .1 5.7" />
            <path d="M16 3v4h-4" />
          </svg>
          <span className="hidden sm:inline">{refreshing ? "Refreshing" : "Refresh"}</span>
        </button>
      </div>
    </header>
  );
}
