"use client";

import { useEffect, useMemo, useState } from "react";
import { NotificationCard } from "./notification-card";
import { DashboardEmptyState } from "./dashboard-empty-state";
import type { NotificationItem } from "./types";

const ORGANIZATION_PREFERENCES_KEY = "oss-manager:organization-groups:v1";

type OrganizationPreferences = {
  order: string[];
  collapsed: string[];
};

const DEFAULT_ORGANIZATION_PREFERENCES: OrganizationPreferences = {
  order: [],
  collapsed: [],
};

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
  const [organizationPreferences, setOrganizationPreferences] =
    useState<OrganizationPreferences>(DEFAULT_ORGANIZATION_PREFERENCES);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(ORGANIZATION_PREFERENCES_KEY);
      if (!stored) return;
      const parsed = JSON.parse(stored) as Partial<OrganizationPreferences>;
      if (
        Array.isArray(parsed.order) &&
        parsed.order.every((owner) => typeof owner === "string") &&
        Array.isArray(parsed.collapsed) &&
        parsed.collapsed.every((owner) => typeof owner === "string")
      ) {
        setOrganizationPreferences({ order: parsed.order, collapsed: parsed.collapsed });
      }
    } catch {
      // Ignore invalid or unavailable browser storage.
    }
  }, []);

  const organizationGroups = useMemo(() => {
    if (!groupByOrganization) return [];
    const groups = new Map<string, NotificationItem[]>();
    for (const notification of notifications) {
      const group = groups.get(notification.repo.owner) ?? [];
      group.push(notification);
      groups.set(notification.repo.owner, group);
    }
    const storedOrder = new Map(
      organizationPreferences.order.map((owner, index) => [owner, index])
    );
    return [...groups.entries()].sort(([a], [b]) => {
      const aIndex = storedOrder.get(a);
      const bIndex = storedOrder.get(b);
      if (aIndex !== undefined && bIndex !== undefined) return aIndex - bIndex;
      if (aIndex !== undefined) return -1;
      if (bIndex !== undefined) return 1;
      return a.localeCompare(b);
    });
  }, [groupByOrganization, notifications, organizationPreferences.order]);

  function saveOrganizationPreferences(next: OrganizationPreferences) {
    setOrganizationPreferences(next);
    try {
      window.localStorage.setItem(ORGANIZATION_PREFERENCES_KEY, JSON.stringify(next));
    } catch {
      // The controls still work for this session when storage is unavailable.
    }
  }

  function toggleOrganization(owner: string) {
    const collapsed = new Set(organizationPreferences.collapsed);
    if (collapsed.has(owner)) collapsed.delete(owner);
    else collapsed.add(owner);
    saveOrganizationPreferences({
      ...organizationPreferences,
      collapsed: [...collapsed],
    });
  }

  function moveOrganization(owner: string, direction: -1 | 1) {
    const order = organizationGroups.map(([groupOwner]) => groupOwner);
    const currentIndex = order.indexOf(owner);
    const nextIndex = currentIndex + direction;
    if (currentIndex < 0 || nextIndex < 0 || nextIndex >= order.length) return;
    [order[currentIndex], order[nextIndex]] = [order[nextIndex], order[currentIndex]];
    saveOrganizationPreferences({ ...organizationPreferences, order });
  }

  const issueList = groupByOrganization ? (
    <div className="space-y-4">
      {organizationGroups.map(([owner, issues], index) => {
        const collapsed = organizationPreferences.collapsed.includes(owner);
        const contentId = `organization-${owner}-issues`;
        return (
          <section key={owner} aria-labelledby={`organization-${owner}`} className="overflow-hidden border border-border bg-panel">
            <div className={collapsed ? "flex items-center gap-2 bg-subtle/40 px-3 py-3" : "flex items-center gap-2 border-b border-border bg-subtle/40 px-3 py-3"}>
              <button
                type="button"
                aria-expanded={!collapsed}
                aria-controls={contentId}
                onClick={() => toggleOrganization(owner)}
                className="flex min-w-0 flex-1 items-center gap-2 px-2 text-left"
              >
                <span aria-hidden="true" className="w-3 text-xs text-muted">{collapsed ? "›" : "⌄"}</span>
                <h2 id={`organization-${owner}`} className="truncate text-sm font-semibold text-primary">{owner}</h2>
                <span className="text-xs text-muted">{issues.length}</span>
              </button>
              <div className="flex shrink-0 items-center" aria-label={`Reorder ${owner}`}>
                <button
                  type="button"
                  onClick={() => moveOrganization(owner, -1)}
                  disabled={index === 0}
                  aria-label={`Move ${owner} up`}
                  className="flex h-7 w-7 items-center justify-center text-sm text-muted hover:bg-panel hover:text-primary disabled:opacity-25"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => moveOrganization(owner, 1)}
                  disabled={index === organizationGroups.length - 1}
                  aria-label={`Move ${owner} down`}
                  className="flex h-7 w-7 items-center justify-center text-sm text-muted hover:bg-panel hover:text-primary disabled:opacity-25"
                >
                  ↓
                </button>
              </div>
            </div>
            {!collapsed ? <ul id={contentId}>{issues.map((notification) => <NotificationCard key={notification.id} notification={notification} onMarkRead={onMarkRead} />)}</ul> : null}
          </section>
        );
      })}
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
