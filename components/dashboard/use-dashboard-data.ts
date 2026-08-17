"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FeedFilter, NotificationItem, TrackedRepo } from "./types";
import { repoKey } from "./types";

export function useDashboardData(enabled: boolean) {
  const [repos, setRepos] = useState<TrackedRepo[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [selectedRepoId, setSelectedRepoId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const loadData = useCallback(async () => {
    const [repoRes, notifRes] = await Promise.all([
      fetch("/api/repos"),
      fetch("/api/notifications"),
    ]);
    if (repoRes.ok) setRepos(await repoRes.json());
    if (notifRes.ok) setNotifications(await notifRes.json());
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [enabled, loadData]);

  const unreadCount = useMemo(
    () => notifications.filter((n) => !n.read).length,
    [notifications]
  );

  const unreadByRepoId = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of notifications) {
      if (n.read) continue;
      const repo = repos.find(
        (r) => r.owner === n.repo.owner && r.name === n.repo.name
      );
      if (repo) map.set(repo.id, (map.get(repo.id) ?? 0) + 1);
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
        : "Unread signals";
    }
    if (selectedRepoId) {
      const repo = repos.find((r) => r.id === selectedRepoId);
      return repo ? `${repo.owner}/${repo.name}` : "Filtered signals";
    }
    return "All signals";
  }, [feedFilter, selectedRepoId, repos]);

  async function addRepo(input: string) {
    setFormError(null);
    setAdding(true);
    const res = await fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: input }),
    });
    setAdding(false);
    if (!res.ok) {
      const body = await res.json();
      setFormError(body.error ?? "Could not add repo");
      return false;
    }
    await loadData();
    return true;
  }

  async function removeRepo(id: string) {
    await fetch(`/api/repos/${id}`, { method: "DELETE" });
    if (selectedRepoId === id) setSelectedRepoId(null);
    await loadData();
  }

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
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
    refresh: loadData,
  };
}
