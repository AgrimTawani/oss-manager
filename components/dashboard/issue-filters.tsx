"use client";

import { cn } from "@/lib/utils";
import type {
  AssignmentFilter,
  IssueStateFilter,
  PullRequestFilter,
  SortOrder,
} from "./types";

const selectClassName =
  "h-9 min-w-0 border border-border bg-panel px-2.5 text-xs text-secondary outline-none hover:bg-subtle focus:border-primary/30 focus:ring-2 focus:ring-primary/10";

export function IssueFilters({
  issueState,
  assignment,
  pullRequest,
  sortOrder,
  groupByOrganization,
  onIssueStateChange,
  onAssignmentChange,
  onPullRequestChange,
  onSortOrderChange,
  onGroupByOrganizationChange,
}: {
  issueState: IssueStateFilter;
  assignment: AssignmentFilter;
  pullRequest: PullRequestFilter;
  sortOrder: SortOrder;
  groupByOrganization: boolean;
  onIssueStateChange: (value: IssueStateFilter) => void;
  onAssignmentChange: (value: AssignmentFilter) => void;
  onPullRequestChange: (value: PullRequestFilter) => void;
  onSortOrderChange: (value: SortOrder) => void;
  onGroupByOrganizationChange: (value: boolean) => void;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Issue filters and sorting">
      <label>
        <span className="sr-only">Issue state</span>
        <select value={issueState} onChange={(event) => onIssueStateChange(event.target.value as IssueStateFilter)} className={selectClassName}>
          <option value="any">Any state</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Assignment status</span>
        <select value={assignment} onChange={(event) => onAssignmentChange(event.target.value as AssignmentFilter)} className={selectClassName}>
          <option value="any">Any assignment</option>
          <option value="unassigned">Unassigned</option>
          <option value="assigned">Assigned</option>
        </select>
      </label>

      <label>
        <span className="sr-only">Linked pull request status</span>
        <select value={pullRequest} onChange={(event) => onPullRequestChange(event.target.value as PullRequestFilter)} className={selectClassName}>
          <option value="any">Any PR status</option>
          <option value="none">No linked PR</option>
          <option value="linked">Has linked PR</option>
        </select>
      </label>

      <label className="sm:ml-auto">
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
