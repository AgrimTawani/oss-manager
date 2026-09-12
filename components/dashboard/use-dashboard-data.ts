"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { repoKey } from "./types";

export function useDashboardData(enabled: boolean) {
  const [repos, setRepos] = useState<TrackedRepo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [issueStateFilter, setIssueStateFilter] = useState<IssueStateFilter>("any");
  const [assignmentFilter, setAssignmentFilter] = useState<AssignmentFilter>("any");
  const [pullRequestFilter, setPullRequestFilter] = useState<PullRequestFilter>("any");
  const [sortOrder, setSortOrder] = useState<SortOrder>("newest");
  const [groupByOrganization, setGroupByOrganization] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async (background = false) => {
    if (background) setRefreshing(true);
    setDataError(null);

    try {
      const [repoRes, notifRes] = await Promise.all([
        fetch("/api/repos"),
        fetch("/api/notifications"),
      ]);

      if (!repoRes.ok || !notifRes.ok) {
        throw new Error("Could not refresh your workspace.");
      }

      const [nextRepos, nextNotifications] = await Promise.all([
        repoRes.json(),
        notifRes.json(),
      ]);
      setRepos(nextRepos);
      setNotifications(nextNotifications);
    } catch {
      setDataError("We couldn't load the latest data. Check your connection and try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [enabled, loadData]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const unreadByRepoId = useMemo(() => {
    const map = new Map<string, number>();
    const repoIds = new Map(repos.map((repo) => [repoKey(repo.owner, repo.name), repo.id]));
    for (const n of notifications) {
      if (n.read) continue;
      const repoId = repoIds.get(repoKey(n.repo.owner, n.repo.name));
      if (repoId) map.set(repoId, (map.get(repoId) ?? 0) + 1);
    }
    return map;
  }, [notifications, repos]);

  const organizations = useMemo<OrganizationSummary[]>(() => {
    const summaries = new Map<string, OrganizationSummary>();
    for (const repo of repos) {
      const current = summaries.get(repo.owner) ?? {
        owner: repo.owner,
        repoCount: 0,
        issueCount: 0,
        unreadCount: 0,
      };
      current.repoCount++;
      summaries.set(repo.owner, current);
    }
    for (const notification of notifications) {
      const current = summaries.get(notification.repo.owner);
      if (!current) continue;
      current.issueCount++;
      if (!notification.read) current.unreadCount++;
    }
    return [...summaries.values()].sort((a, b) => a.owner.localeCompare(b.owner));
  }, [notifications, repos]);

  const readyCount = useMemo(
    () => notifications.filter((notification) =>
      notification.issueState === "OPEN" &&
      notification.assigneeCount === 0 &&
      notification.linkedPullRequestCount === 0
    ).length,
    [notifications]
  );

  const readyViewActive =
    feedFilter === "all" &&
    issueStateFilter === "open" &&
    assignmentFilter === "unassigned" &&
    pullRequestFilter === "none";

  const filteredNotifications = useMemo(() => {
    let list = notifications;

    if (selectedRepoId) {
      const repo = repos.find((r) => r.id === selectedRepoId);
      if (repo) {
        list = list.filter(
          (n) => n.repo.owner === repo.owner && n.repo.name === repo.name
        );
      }
    }

    if (selectedOwner) {
      list = list.filter((notification) => notification.repo.owner === selectedOwner);
    }

    if (feedFilter === "unread") {
      list = list.filter((n) => !n.read);
    }


    if (issueStateFilter !== "any") {
      list = list.filter((notification) =>
        notification.issueState === issueStateFilter.toUpperCase()
      );
    }

    if (assignmentFilter === "unassigned") {
      list = list.filter((notification) => notification.assigneeCount === 0);
    } else if (assignmentFilter === "assigned") {
      list = list.filter((notification) => (notification.assigneeCount ?? 0) > 0);
    }

    if (pullRequestFilter === "none") {
      list = list.filter((notification) => notification.linkedPullRequestCount === 0);
    } else if (pullRequestFilter === "linked") {
      list = list.filter((notification) => (notification.linkedPullRequestCount ?? 0) > 0);
    }

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter((n) => {
        const haystack = [
          n.title,
          n.authorLogin,
          repoKey(n.repo.owner, n.repo.name),
        ]
          .join(" ")
          .toLowerCase();
        return haystack.includes(q);
      });
    }

    return [...list].sort((a, b) => {
      const aTime = new Date(a.issueCreatedAt ?? a.createdAt).getTime();
      const bTime = new Date(b.issueCreatedAt ?? b.createdAt).getTime();
      return sortOrder === "newest" ? bTime - aTime : aTime - bTime;
    });
  }, [
    notifications,
    repos,
    selectedRepoId,
    selectedOwner,
    feedFilter,
    issueStateFilter,
    assignmentFilter,
    pullRequestFilter,
    searchQuery,
    sortOrder,
  ]);

  const feedTitle = useMemo(() => {
    const selectedRepo = selectedRepoId ? repos.find((repo) => repo.id === selectedRepoId) : null;
    const scope = selectedRepo
      ? `${selectedRepo.owner}/${selectedRepo.name}`
      : selectedOwner ?? null;

    if (readyViewActive) return scope ? `Ready to pick up · ${scope}` : "Ready to pick up";
    if (feedFilter === "unread") return scope ? `Unread · ${scope}` : "Unread issues";
    if (selectedRepoId) {
      return selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : "Filtered issues";
    }
    if (selectedOwner) return selectedOwner;
    return "All issues";
  }, [feedFilter, readyViewActive, selectedOwner, selectedRepoId, repos]);

  async function addRepo(input: string) {
    setFormError(null);
    setAdding(true);
    try {
      const res = await fetch("/api/repos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ repo: input }),
      });
      if (!res.ok) {
        const body = await res.json();
        setFormError(body.error ?? "Could not add repo");
        return false;
      }
      await loadData();
      return true;
    } catch {
      setFormError("Could not reach the server. Try again.");
      return false;
    } finally {
      setAdding(false);
    }
  }

  async function removeRepo(id: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/repos/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      if (selectedRepoId === id) setSelectedRepoId(null);
      const removedRepo = repos.find((repo) => repo.id === id);
      setRepos((current) => current.filter((repo) => repo.id !== id));
      if (removedRepo) {
        setNotifications((current) =>
          current.filter(
            (notification) =>
              notification.repo.owner !== removedRepo.owner ||
              notification.repo.name !== removedRepo.name
          )
        );
      }
      return true;
    } catch {
      setDataError("That repository could not be removed. Please try again.");
      return false;
    }
  }

  async function markRead(id: string) {
    const previous = notifications.find((notification) => notification.id === id);
    if (!previous || previous.read) return;

    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification
      )
    );

    try {
      const res = await fetch(`/api/notifications/${id}/read`, { method: "POST" });
      if (!res.ok) throw new Error();
    } catch {
      setNotifications((current) =>
        current.map((notification) =>
          notification.id === id ? { ...notification, read: false } : notification
        )
      );
      setDataError("Could not mark that issue as read.");
    }
  }

  function clearFilters() {
    setSelectedRepoId(null);
    setSelectedOwner(null);
    setFeedFilter("all");
    setIssueStateFilter("any");
    setAssignmentFilter("any");
    setPullRequestFilter("any");
    setSortOrder("newest");
    setGroupByOrganization(false);
    setSearchQuery("");
  }

  function selectRepo(id: string | null) {
    setSelectedRepoId(id);
    if (id) setSelectedOwner(null);
  }

  function selectOwner(owner: string | null) {
    setSelectedOwner(owner);
    if (owner) setSelectedRepoId(null);
  }

  function showAllIssues() {
    clearFilters();
  }

  function showUnreadIssues() {
    setSelectedRepoId(null);
    setSelectedOwner(null);
    setFeedFilter("unread");
    setIssueStateFilter("any");
    setAssignmentFilter("any");
    setPullRequestFilter("any");
  }

  function showReadyIssues() {
    setSelectedRepoId(null);
    setSelectedOwner(null);
    setFeedFilter("all");
    setIssueStateFilter("open");
    setAssignmentFilter("unassigned");
    setPullRequestFilter("none");
  }

  return {
    repos,
    notifications,
    loading,
    refreshing,
    dataError,
    adding,
    formError,
    setFormError,
    selectedRepoId,
    selectRepo,
    selectedOwner,
    selectOwner,
    organizations,
    readyCount,
    feedFilter,
    setFeedFilter,
    issueStateFilter,
    setIssueStateFilter,
    assignmentFilter,
    setAssignmentFilter,
    pullRequestFilter,
    setPullRequestFilter,
    sortOrder,
    setSortOrder,
    groupByOrganization,
    setGroupByOrganization,
    readyViewActive,
    searchQuery,
    setSearchQuery,
    unreadCount,
    unreadByRepoId,
    filteredNotifications,
    feedTitle,
    addRepo,
    removeRepo,
    markRead,
    clearFilters,
    showAllIssues,
    showUnreadIssues,
    showReadyIssues,
    refresh: () => loadData(true),
  };
}
