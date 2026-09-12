"use client";

import { useMemo } from "react";
import { NotificationCard } from "./notification-card";
import { DashboardEmptyState } from "./dashboard-empty-state";
import type { NotificationItem } from "./types";

export function NotificationFeed({
  notifications, allNotificationsCount, reposCount, loading, feedTitle,
  hasActiveFilters, groupByOrganization, onClearFilters, onMarkRead,
}: {
  notifications: NotificationItem[];
  allNotificationsCount: number;
  reposCount: number;
  loading: boolean;
  feedTitle: string;
  hasActiveFilters: boolean;
  groupByOrganization: boolean;
  onClearFilters: () => void;
  onMarkRead: (id: string) => void;
}) {
  const organizationGroups = useMemo(() => {
    if (!groupByOrganization) return [];
    const groups = new Map<string, NotificationItem[]>();
    for (const notification of notifications) {
      const group = groups.get(notification.repo.owner) ?? [];
      group.push(notification);
      groups.set(notification.repo.owner, group);
    }
    return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [groupByOrganization, notifications]);

  const issueList = groupByOrganization ? (
    <div className="space-y-4">
      {organizationGroups.map(([owner, issues]) => (
        <section key={owner} aria-labelledby={`organization-${owner}`} className="overflow-hidden border border-border bg-panel">
          <div className="flex items-center justify-between border-b border-border bg-subtle/40 px-5 py-3">
            <h2 id={`organization-${owner}`} className="text-sm font-semibold text-primary">{owner}</h2>
            <span className="text-xs text-muted">{issues.length} {issues.length === 1 ? "issue" : "issues"}</span>
          </div>
          <ul>{issues.map((notification) => <NotificationCard key={notification.id} notification={notification} onMarkRead={onMarkRead} />)}</ul>
        </section>
      ))}
    </div>
  ) : (
    <div className="overflow-hidden border border-border bg-panel">
      <ul>{notifications.map((notification) => <NotificationCard key={notification.id} notification={notification} onMarkRead={onMarkRead} />)}</ul>
    </div>
  );

  return (
    <section aria-labelledby="feed-heading">
      <div className="mb-5 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <p className="text-xs font-medium text-muted">ISSUE INBOX</p>
          <h1 id="feed-heading" className="mt-1 text-2xl font-semibold tracking-tight text-primary">{feedTitle}</h1>
        </div>
        <p className="text-xs text-muted">
          {notifications.length} {notifications.length === 1 ? "issue" : "issues"}
          {allNotificationsCount !== notifications.length ? ` of ${allNotificationsCount}` : ""}
        </p>
      </div>

      {loading || reposCount === 0 || notifications.length === 0 ? <div className="overflow-hidden border border-border bg-panel">
        {loading ? (
          <div className="divide-y divide-border" aria-label="Loading issues">
            {[1, 2, 3, 4].map((item) => <div key={item} className="h-28 animate-pulse bg-subtle/40" />)}
          </div>
        ) : reposCount === 0 ? (
          <DashboardEmptyState title="Track your first repository" description="Use + Add in the repository sidebar and enter an owner/repository pair. Relevant issues will appear here after the next check." />
        ) : notifications.length === 0 ? (
          <DashboardEmptyState
            title={hasActiveFilters ? "No issues match this view" : "You're all caught up"}
            description={hasActiveFilters ? "Clear your filters or try a broader search." : "There are no maintainer or contributor issues in your inbox yet."}
            action={hasActiveFilters ? <button type="button" onClick={onClearFilters} className="border border-border bg-panel px-3 py-2 text-xs font-medium text-secondary hover:bg-subtle hover:text-primary">Clear filters</button> : undefined}
          />
        ) : null}
      </div> : issueList}

      <p className="mt-4 text-xs leading-5 text-muted">Issues are checked every 15 minutes. Only owners, members, collaborators, and past contributors appear here.</p>
    </section>
  );
}
