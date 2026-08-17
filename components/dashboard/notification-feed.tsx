"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { NotificationCard } from "./notification-card";
import { DashboardEmptyState } from "./dashboard-empty-state";
import type { NotificationItem } from "./types";

export function NotificationFeed({
  notifications,
  allNotificationsCount,
  reposCount,
  loading,
  feedTitle,
  hasActiveFilters,
  onClearFilters,
  onMarkRead,
}: {
  notifications: NotificationItem[];
  allNotificationsCount: number;
  reposCount: number;
  loading: boolean;
  feedTitle: string;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  onMarkRead: (id: string) => void;
}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mq.matches);
    const handler = () => setReducedMotion(mq.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  return (
    <section className="flex h-full min-h-0 flex-col rounded-[1.5rem] border border-white/10 bg-[#0c0d14]/70 p-1.5 backdrop-blur-sm">
      <div className="flex min-h-0 flex-1 flex-col rounded-[calc(1.5rem-0.375rem)] border border-white/[0.04] bg-[#10111a]/80 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <div className="flex items-center justify-between border-b border-white/[0.06] px-5 py-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent/70">
              Signal feed
            </p>
            <h2 className="mt-1 text-lg font-medium tracking-[-0.02em] text-ink">
              {feedTitle}
            </h2>
          </div>
          <p className="font-mono text-[10px] text-ink/35">
            {notifications.length} shown
            {allNotificationsCount !== notifications.length &&
              ` · ${allNotificationsCount} total`}
          </p>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {loading ? (
            <ul className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <li
                  key={i}
                  className="h-28 animate-pulse rounded-[1.25rem] border border-white/[0.04] bg-white/[0.02]"
                />
              ))}
            </ul>
          ) : reposCount === 0 ? (
            <DashboardEmptyState
              title="Your feed is waiting"
              description="Add a repository in the sidebar to begin receiving maintainer and contributor issue signals."
            />
          ) : notifications.length === 0 ? (
            <DashboardEmptyState
              title={
                hasActiveFilters ? "No matches for this view" : "No signals yet"
              }
              description={
                hasActiveFilters
                  ? "Try clearing filters or search to see more notifications."
                  : "When a maintainer or contributor opens an issue on a tracked repo, it will appear here."
              }
              action={
                hasActiveFilters ? (
                  <button
                    type="button"
                    onClick={onClearFilters}
                    className="rounded-full border border-white/10 px-4 py-2 text-xs text-ink/60 transition-colors hover:border-white/20 hover:text-ink"
                  >
                    Clear filters
                  </button>
                ) : undefined
              }
            />
          ) : (
            <motion.ul layout className="space-y-3">
              {notifications.map((n, i) => (
                <NotificationCard
                  key={n.id}
                  notification={n}
                  index={i}
                  onMarkRead={onMarkRead}
                  reducedMotion={reducedMotion}
                />
              ))}
            </motion.ul>
          )}
        </div>
      </div>
    </section>
  );
}
