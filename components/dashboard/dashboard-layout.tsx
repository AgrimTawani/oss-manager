"use client";

import { useState } from "react";
import { CommandBar } from "./command-bar";
import { RepoSidebar } from "./repo-sidebar";
import { NotificationFeed } from "./notification-feed";
import { IssueFilters } from "./issue-filters";
import type {
  AssignmentFilter,
  FeedFilter,
  IssueStateFilter,
  NotificationItem,
  OrganizationSummary,
  PullRequestFilter,
  SortOrder,
  TrackedRepo,
} from "./types";

type DashboardLayoutProps = {
  username?: string | null;
  avatarUrl?: string | null;
  repos: TrackedRepo[];
  notifications: NotificationItem[];
  filteredNotifications: NotificationItem[];
  loading: boolean;
  refreshing: boolean;
  dataError: string | null;
  adding: boolean;
  formError: string | null;
  selectedRepoId: string | null;
  selectedOwner: string | null;
  organizations: OrganizationSummary[];
  unreadByRepoId: Map<string, number>;
  unreadCount: number;
  readyCount: number;
  feedFilter: FeedFilter;
  issueStateFilter: IssueStateFilter;
  assignmentFilter: AssignmentFilter;
  pullRequestFilter: PullRequestFilter;
  sortOrder: SortOrder;
  groupByOrganization: boolean;
  readyViewActive: boolean;
  feedTitle: string;
  searchQuery: string;
  onSelectRepo: (id: string | null) => void;
  onSelectOwner: (owner: string | null) => void;
  onAddRepo: (input: string) => Promise<boolean>;
  onRemoveRepo: (id: string) => Promise<boolean>;
  onMarkRead: (id: string) => void;
  onIssueStateFilterChange: (filter: IssueStateFilter) => void;
  onAssignmentFilterChange: (filter: AssignmentFilter) => void;
  onPullRequestFilterChange: (filter: PullRequestFilter) => void;
  onSortOrderChange: (sort: SortOrder) => void;
  onGroupByOrganizationChange: (grouped: boolean) => void;
  onShowAllIssues: () => void;
  onShowUnreadIssues: () => void;
  onShowReadyIssues: () => void;
  onSearchChange: (query: string) => void;
  onClearFilters: () => void;
  onRefresh: () => void;
};

export function DashboardLayout({
  username, avatarUrl, repos, notifications, filteredNotifications, loading,
  refreshing, dataError, adding, formError, selectedRepoId, selectedOwner,
  organizations, unreadByRepoId, unreadCount, readyCount, feedFilter,
  issueStateFilter, assignmentFilter, pullRequestFilter, sortOrder,
  groupByOrganization, readyViewActive, feedTitle, searchQuery, onSelectRepo,
  onSelectOwner, onAddRepo, onRemoveRepo, onMarkRead,
  onIssueStateFilterChange, onAssignmentFilterChange, onPullRequestFilterChange,
  onSortOrderChange, onGroupByOrganizationChange, onShowAllIssues,
  onShowUnreadIssues, onShowReadyIssues, onSearchChange, onClearFilters, onRefresh,
}: DashboardLayoutProps) {
  const [mobileReposOpen, setMobileReposOpen] = useState(false);
  const hasActiveFilters =
    feedFilter !== "all" || Boolean(selectedRepoId) || Boolean(selectedOwner) ||
    issueStateFilter !== "any" || assignmentFilter !== "any" ||
    pullRequestFilter !== "any" || searchQuery.trim().length > 0;
  const allIssuesViewActive =
    feedFilter === "all" && !selectedRepoId && !selectedOwner &&
    issueStateFilter === "any" && assignmentFilter === "any" &&
    pullRequestFilter === "any";

  const sidebarProps = {
    repos, loading, adding, formError, selectedRepoId, unreadByRepoId,
    unreadCount, readyCount, feedFilter, readyViewActive, selectedOwner,
    organizations, allIssuesViewActive, username, avatarUrl, onAddRepo,
    onRemoveRepo, onSelectOwner, onShowAllIssues, onShowUnreadIssues,
    onShowReadyIssues,
  };

  return (
    <div className="min-h-screen bg-canvas text-primary lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
      <RepoSidebar
        {...sidebarProps}
        onSelectRepo={onSelectRepo}
        className="hidden lg:flex"
      />

      <main className="min-w-0">
        <CommandBar
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
          onOpenRepos={() => setMobileReposOpen(true)}
          onRefresh={onRefresh}
          refreshing={refreshing}
          reposCount={repos.length}
        />

        <div className="mx-auto w-full max-w-6xl px-4 py-5 sm:px-6 lg:px-10 lg:py-8">
          {dataError ? (
            <div className="mb-5 flex items-center justify-between gap-4 border border-danger/25 bg-danger/5 px-4 py-3 text-sm text-danger">
              <span>{dataError}</span>
              <button type="button" onClick={onRefresh} className="font-medium underline underline-offset-4">
                Retry
              </button>
            </div>
          ) : null}

          <IssueFilters
            issueState={issueStateFilter}
            assignment={assignmentFilter}
            pullRequest={pullRequestFilter}
            sortOrder={sortOrder}
            groupByOrganization={groupByOrganization}
            onIssueStateChange={onIssueStateFilterChange}
            onAssignmentChange={onAssignmentFilterChange}
            onPullRequestChange={onPullRequestFilterChange}
            onSortOrderChange={onSortOrderChange}
            onGroupByOrganizationChange={onGroupByOrganizationChange}
          />

          <NotificationFeed
            notifications={filteredNotifications}
            allNotificationsCount={notifications.length}
            reposCount={repos.length}
            loading={loading}
            feedTitle={feedTitle}
            hasActiveFilters={hasActiveFilters}
            groupByOrganization={groupByOrganization}
            onClearFilters={onClearFilters}
            onMarkRead={onMarkRead}
          />
        </div>
      </main>

      {mobileReposOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close repositories menu"
            onClick={() => setMobileReposOpen(false)}
            className="absolute inset-0 bg-black/60"
          />
          <RepoSidebar
            {...sidebarProps}
            onSelectRepo={(id) => { onSelectRepo(id); setMobileReposOpen(false); }}
            onSelectOwner={(owner) => { onSelectOwner(owner); setMobileReposOpen(false); }}
            onShowAllIssues={() => { onShowAllIssues(); setMobileReposOpen(false); }}
            onShowUnreadIssues={() => { onShowUnreadIssues(); setMobileReposOpen(false); }}
            onShowReadyIssues={() => { onShowReadyIssues(); setMobileReposOpen(false); }}
            onClose={() => setMobileReposOpen(false)}
            className="absolute inset-y-0 left-0 flex w-[min(88vw,320px)]"
          />
        </div>
      ) : null}
    </div>
  );
}
