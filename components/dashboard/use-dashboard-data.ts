"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeedFilter, NotificationItem, TrackedRepo } from "./types";
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
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
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

    return list;
  }, [notifications, repos, selectedRepoId, feedFilter, searchQuery]);

  const feedTitle = useMemo(() => {
    if (feedFilter === "unread") {
      return selectedRepoId
        ? `Unread · ${repos.find((r) => r.id === selectedRepoId)?.owner}/${repos.find((r) => r.id === selectedRepoId)?.name}`
        : "Unread issues";
    }
    if (selectedRepoId) {
      const repo = repos.find((r) => r.id === selectedRepoId);
      return repo ? `${repo.owner}/${repo.name}` : "Filtered signals";
    }
    return "All issues";
  }, [feedFilter, selectedRepoId, repos]);

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
    setFeedFilter("all");
    setSearchQuery("");
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
    setSelectedRepoId,
    feedFilter,
    setFeedFilter,
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
    refresh: () => loadData(true),
  };
}
