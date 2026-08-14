"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useEffect, useState, useCallback } from "react";

interface Repo {
  id: string;
  owner: string;
  name: string;
  lastPolledAt: string | null;
}

interface Notification {
  id: string;
  title: string;
  issueUrl: string;
  authorLogin: string;
  authorAssociation: string;
  createdAt: string;
  read: boolean;
  repo: { owner: string; name: string };
}

const ASSOCIATION_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Org member",
  COLLABORATOR: "Collaborator",
  CONTRIBUTOR: "Past contributor",
};

export default function Home() {
  const { data: session, status } = useSession();
  const [repos, setRepos] = useState<Repo[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [repoInput, setRepoInput] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    const [repoRes, notifRes] = await Promise.all([
      fetch("/api/repos"),
      fetch("/api/notifications"),
    ]);
    if (repoRes.ok) setRepos(await repoRes.json());
    if (notifRes.ok) setNotifications(await notifRes.json());
  }, []);

  useEffect(() => {
    if (status === "authenticated") {
      loadData();
      const interval = setInterval(loadData, 30000);
      return () => clearInterval(interval);
    }
  }, [status, loadData]);

  async function handleAddRepo(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setLoading(true);
    const res = await fetch("/api/repos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ repo: repoInput }),
    });
    setLoading(false);
    if (!res.ok) {
      const body = await res.json();
      setFormError(body.error ?? "Could not add repo");
      return;
    }
    setRepoInput("");
    loadData();
  }

  async function handleRemoveRepo(id: string) {
    await fetch(`/api/repos/${id}`, { method: "DELETE" });
    loadData();
  }

  async function handleMarkRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "POST" });
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  if (status === "loading") {
    return <div className="max-w-2xl mx-auto p-8 text-sm text-ink/60">Loading…</div>;
  }

  if (status !== "authenticated") {
    return (
      <div className="max-w-md mx-auto p-8 mt-24 text-center">
        <h1 className="text-xl font-medium">OSS contribution manager</h1>
        <p className="mt-2 text-sm text-ink/60">
          Track repos you want to contribute to. Get notified only when a maintainer, org
          member, or past contributor opens a new issue.
        </p>
        <button
          onClick={() => signIn("github")}
          className="mt-6 px-4 py-2 bg-ink text-white rounded-md text-sm hover:bg-ink/90"
        >
          Sign in with GitHub
        </button>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto p-6 sm:p-8">
      <header className="flex items-center justify-between border-b border-line pb-4">
        <h1 className="text-lg font-medium">OSS contribution manager</h1>
        <button onClick={() => signOut()} className="text-sm text-ink/60 hover:text-ink">
          Sign out
        </button>
      </header>

      <section className="mt-8">
        <h2 className="text-sm font-medium text-ink/60 uppercase tracking-wide">
          Tracked repos
        </h2>
        <form onSubmit={handleAddRepo} className="mt-3 flex gap-2">
          <input
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            placeholder="owner/name or github.com/owner/name"
            className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-accent"
          />
          <button
            type="submit"
            disabled={loading || !repoInput}
            className="px-4 py-2 bg-accent text-white rounded-md text-sm disabled:opacity-50"
          >
            Add
          </button>
        </form>
        {formError && <p className="mt-2 text-sm text-red-600">{formError}</p>}

        <ul className="mt-4 divide-y divide-line">
          {repos.length === 0 && (
            <li className="py-4 text-sm text-ink/50">
              No repos yet. Add one above to start tracking its issues.
            </li>
          )}
          {repos.map((repo) => (
            <li key={repo.id} className="py-3 flex items-center justify-between">
              <div>
                <a
                  href={`https://github.com/${repo.owner}/${repo.name}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-sm font-medium hover:underline"
                >
                  {repo.owner}/{repo.name}
                </a>
                <p className="text-xs text-ink/40 mt-0.5">
                  {repo.lastPolledAt
                    ? `Last checked ${new Date(repo.lastPolledAt).toLocaleTimeString()}`
                    : "Not checked yet"}
                </p>
              </div>
              <button
                onClick={() => handleRemoveRepo(repo.id)}
                className="text-xs text-ink/40 hover:text-red-600"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-sm font-medium text-ink/60 uppercase tracking-wide">
          Notifications {unreadCount > 0 && `(${unreadCount} unread)`}
        </h2>
        <ul className="mt-4 divide-y divide-line">
          {notifications.length === 0 && (
            <li className="py-4 text-sm text-ink/50">
              Nothing yet. You&apos;ll see issues here once a maintainer or contributor opens
              one on a tracked repo.
            </li>
          )}
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`py-3 ${n.read ? "opacity-50" : ""}`}
              onMouseEnter={() => !n.read && handleMarkRead(n.id)}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <a
                    href={n.issueUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium hover:underline block truncate"
                  >
                    {n.title}
                  </a>
                  <p className="text-xs text-ink/50 mt-0.5">
                    {n.repo.owner}/{n.repo.name} · opened by {n.authorLogin} ·{" "}
                    {new Date(n.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className="shrink-0 text-xs px-2 py-0.5 rounded-full bg-accent/10 text-accent">
                  {ASSOCIATION_LABEL[n.authorAssociation] ?? n.authorAssociation}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
