"use client";

import { cn } from "@/lib/utils";
import type { SortOrder } from "./types";

const selectClassName =
  "h-9 min-w-0 border border-border bg-panel px-2.5 text-xs text-secondary outline-none hover:bg-subtle focus:border-primary/30 focus:ring-2 focus:ring-primary/10";

export function IssueFilters({
  sortOrder,
  groupByOrganization,
  onSortOrderChange,
  onGroupByOrganizationChange,
}: {
  sortOrder: SortOrder;
  groupByOrganization: boolean;
  onSortOrderChange: (value: SortOrder) => void;
  onGroupByOrganizationChange: (value: boolean) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Issue filters and sorting">
      <label className="ml-auto">
        <span className="sr-only">Sort issues</span>
        <select value={sortOrder} onChange={(event) => onSortOrderChange(event.target.value as SortOrder)} className={selectClassName}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </label>

      <button
        type="button"
        aria-pressed={groupByOrganization}
        onClick={() => onGroupByOrganizationChange(!groupByOrganization)}
        className={cn(
          "h-9 border px-3 text-xs font-medium",
          groupByOrganization
            ? "border-accent/40 bg-accent/10 text-accent"
            : "border-border bg-panel text-secondary hover:bg-subtle hover:text-primary"
        )}
      >
        Group by org
      </button>
    </div>
  );
}
