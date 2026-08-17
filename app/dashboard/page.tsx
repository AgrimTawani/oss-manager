"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { PageBackground } from "@/components/ui/page-background";
import { cn } from "@/lib/utils";

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

const ASSOCIATION_STYLE: Record<string, string> = {
  OWNER: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  MEMBER: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  COLLABORATOR: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  CONTRIBUTOR: "bg-amber-500/15 text-amber-300 border-amber-500/20",
};

function Panel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("rounded-[1.5rem] border border-white/10 bg-[#0c0d14]/70 p-1.5 backdrop-blur-sm", className)}>
      <div className="rounded-[calc(1.5rem-0.375rem)] border border-white/[0.04] bg-[#10111a]/80 p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-base font-medium text-ink">{title}</h2>
          {description && <p className="mt-1 text-sm text-ink/45">{description}</p>}
        </div>
        {children}
      </div>
    </section>
  );
}

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-[#0c0d14]/60 px-4 py-4 backdrop-blur-sm">
      <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-ink/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.02em] text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink/40">{hint}</p>}
    </div>
  );
}

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
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
    if (status === "unauthenticated") {
      router.replace("/");
    }
  }, [status, router]);

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

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="relative flex min-h-[100dvh] items-center justify-center text-sm text-ink/60">
        <PageBackground />
        Loading…
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;
  const lastPolled = repos
    .map((r) => r.lastPolledAt)
    .filter(Boolean)
    .sort()
    .pop();

  return (
    <DashboardShell username={session?.user?.name} avatarUrl={session?.user?.image}>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent/80">
            Dashboard
          </p>
          <h1 className="mt-2 font-display text-3xl tracking-[-0.02em] text-ink sm:text-4xl">
            Your contribution radar
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-ink/50">
            Track repos, filter maintainer signals, and jump into issues worth your time.
          </p>
        </div>

        <div className="mb-8 grid gap-3 sm:grid-cols-3">
          <StatCard label="Tracked repos" value={repos.length} />
          <StatCard
            label="Unread"
            value={unreadCount}
            hint={unreadCount > 0 ? "Hover a notification to mark read" : "All caught up"}
          />
          <StatCard
            label="Last poll"
            value={
              lastPolled
                ? new Date(lastPolled).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                : "Pending"
            }
            hint="Runs every 15 minutes"
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <Panel
            title="Tracked repositories"
            description="Add public repos you want to contribute to."
            className="lg:col-span-2"
          >
            <form onSubmit={handleAddRepo} className="flex flex-col gap-3 sm:flex-row">
              <input
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                placeholder="owner/name"
                className="flex-1 rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-ink placeholder:text-ink/30 focus:border-accent/40 focus:outline-none focus:ring-2 focus:ring-accent/20"
              />
              <button
                type="submit"
                disabled={loading || !repoInput}
                className="rounded-xl bg-accent px-5 py-3 text-sm font-medium text-white transition-all hover:bg-accent/90 disabled:opacity-50 active:scale-[0.98]"
              >
                {loading ? "Adding…" : "Add repo"}
              </button>
            </form>
            {formError && (
              <p className="mt-3 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {formError}
              </p>
            )}

            <ul className="mt-5 space-y-2">
              {repos.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-ink/45">
                  No repos yet. Add one above to start tracking maintainer issues.
                </li>
              )}
              {repos.map((repo) => (
                <li
                  key={repo.id}
                  className="group flex items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-3 transition-colors hover:border-white/12 hover:bg-white/[0.04]"
                >
                  <div className="min-w-0">
                    <a
                      href={`https://github.com/${repo.owner}/${repo.name}`}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-sm font-medium text-ink hover:text-white"
                    >
                      {repo.owner}/{repo.name}
                    </a>
                    <p className="mt-0.5 font-mono text-[11px] text-ink/40">
                      {repo.lastPolledAt
                        ? `Checked ${new Date(repo.lastPolledAt).toLocaleString()}`
                        : "Awaiting first poll"}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveRepo(repo.id)}
                    className="ml-3 shrink-0 rounded-lg px-2 py-1 text-xs text-ink/35 transition-colors hover:bg-red-500/10 hover:text-red-300"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </Panel>

          <Panel
            title="Notifications"
            description={
              unreadCount > 0
                ? `${unreadCount} unread maintainer or contributor issue${unreadCount === 1 ? "" : "s"}`
                : "Issues from maintainers and contributors appear here."
            }
            className="lg:col-span-3"
          >
            <ul className="space-y-2">
              {notifications.length === 0 && (
                <li className="rounded-xl border border-dashed border-white/10 px-4 py-10 text-center">
                  <p className="text-sm text-ink/50">Nothing yet.</p>
                  <p className="mt-1 text-xs text-ink/35">
                    When a maintainer or contributor opens an issue on a tracked repo, it shows up
                    here.
                  </p>
                </li>
              )}
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={cn(
                    "rounded-xl border px-4 py-3 transition-all",
                    n.read
                      ? "border-white/[0.04] bg-white/[0.01] opacity-60"
                      : "border-accent/20 bg-accent/[0.04] shadow-[0_0_0_1px_rgba(52,87,213,0.08)]"
                  )}
                  onMouseEnter={() => !n.read && handleMarkRead(n.id)}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <a
                        href={n.issueUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="block text-sm font-medium leading-snug text-ink hover:underline"
                      >
                        {n.title}
                      </a>
                      <p className="mt-1.5 font-mono text-[11px] text-ink/45">
                        {n.repo.owner}/{n.repo.name} · {n.authorLogin} ·{" "}
                        {new Date(n.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                        ASSOCIATION_STYLE[n.authorAssociation] ?? "bg-white/10 text-ink/60 border-white/10"
                      )}
                    >
                      {ASSOCIATION_LABEL[n.authorAssociation] ?? n.authorAssociation}
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
