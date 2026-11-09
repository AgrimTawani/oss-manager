"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type {
  FeedFilter,
  NotificationItem,
  OrganizationSummary,
  SortOrder,
  TrackedRepo,
} from "./types";
import { repoKey } from "./types";

// How often an open, visible dashboard asks the server to re-check GitHub.
// The server skips anything checked more recently, so this is cheap.
const INBOX_SYNC_INTERVAL_MS = 5 * 60 * 1000;

export function useDashboardData(enabled: boolean) {
  const [repos, setRepos] = useState<TrackedRepo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [githubAccessExpired, setGithubAccessExpired] = useState(false);
  const syncInFlight = useRef<Promise<boolean> | null>(null);

  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [selectedOwner, setSelectedOwner] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
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

  /** Asks the server to re-check GitHub for this user's repos and visible
   * issues, then reloads if anything changed. Resolves true when it reloaded.
   * Overlapping calls share one request. */
  const syncInbox = useCallback(() => {
    if (syncInFlight.current) return syncInFlight.current;
    syncInFlight.current = (async () => {
      try {
        const res = await fetch("/api/notifications/refresh", { method: "POST" });
        if (!res.ok) return false;
        const result: {
          notificationsCreated: number;
          metadataRefreshed: number;
          githubAccessExpired: boolean;
        } = await res.json();
        setGithubAccessExpired(result.githubAccessExpired);
        if (result.notificationsCreated > 0 || result.metadataRefreshed > 0) {
          await loadData(true);
          return true;
        }
        return false;
      } catch {
        // The scheduled poll still runs; a failed sync just waits for the next one.
        return false;
      } finally {
        syncInFlight.current = null;
      }
    })();
    return syncInFlight.current;
  }, [loadData]);

  useEffect(() => {
    if (!enabled) return;
    loadData();
    const interval = setInterval(() => loadData(true), 30000);
    return () => clearInterval(interval);
  }, [enabled, loadData]);

  useEffect(() => {
    if (!enabled) return;
    const syncIfVisible = () => {
      if (document.visibilityState === "visible") void syncInbox();
    };
    syncIfVisible();
    const interval = setInterval(syncIfVisible, INBOX_SYNC_INTERVAL_MS);
    document.addEventListener("visibilitychange", syncIfVisible);
    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", syncIfVisible);
    };
  }, [enabled, syncInbox]);

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
    searchQuery,
    sortOrder,
  ]);

  const feedTitle = useMemo(() => {
    const selectedRepo = selectedRepoId ? repos.find((repo) => repo.id === selectedRepoId) : null;
    const scope = selectedRepo
      ? `${selectedRepo.owner}/${selectedRepo.name}`
      : selectedOwner ?? null;

    if (feedFilter === "unread") return scope ? `Unread · ${scope}` : "Unread issues";
    if (selectedRepoId) {
      return selectedRepo ? `${selectedRepo.owner}/${selectedRepo.name}` : "Filtered issues";
    }
    if (selectedOwner) return selectedOwner;
    return "All issues";
  }, [feedFilter, selectedOwner, selectedRepoId, repos]);

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
    feedFilter,
    setFeedFilter,
    sortOrder,
    setSortOrder,
    groupByOrganization,
    setGroupByOrganization,
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
    githubAccessExpired,
    refresh: async () => {
      setRefreshing(true);
      if (!(await syncInbox())) await loadData(true);
    },
  };
}
