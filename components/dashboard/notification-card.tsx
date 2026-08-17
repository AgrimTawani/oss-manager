"use client";

import { motion } from "framer-motion";
import { cn, formatRelativeTime } from "@/lib/utils";
import {
  ASSOCIATION_BADGE,
  ASSOCIATION_LABEL,
  ASSOCIATION_STRIPE,
  repoKey,
} from "./types";
import type { NotificationItem } from "./types";

const EASE = [0.32, 0.72, 0, 1] as const;

export function NotificationCard({
  notification,
  index,
  onMarkRead,
  reducedMotion,
}: {
  notification: NotificationItem;
  index: number;
  onMarkRead: (id: string) => void;
  reducedMotion: boolean;
}) {
  const stripe =
    ASSOCIATION_STRIPE[notification.authorAssociation] ?? "bg-white/30";
  const badge =
    ASSOCIATION_BADGE[notification.authorAssociation] ??
    "bg-white/10 text-ink/60 border-white/10";

  return (
    <motion.li
      layout
      initial={reducedMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reducedMotion ? 0 : index * 0.04, duration: 0.5, ease: EASE }}
      className="list-none"
      onMouseEnter={() => !notification.read && onMarkRead(notification.id)}
    >
      <div
        className={cn(
          "group relative overflow-hidden rounded-[1.25rem] border transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)]",
          notification.read
            ? "border-white/[0.04] bg-white/[0.015] opacity-55"
            : "border-accent/20 bg-accent/[0.04] shadow-[0_0_24px_rgba(52,87,213,0.08)] hover:border-accent/30"
        )}
      >
        <div className={cn("absolute inset-y-0 left-0 w-[3px]", stripe)} />

        <div className="flex flex-col gap-4 p-4 pl-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h3
              className={cn(
                "line-clamp-2 leading-snug text-ink",
                notification.read ? "text-sm" : "text-base font-medium"
              )}
            >
              {notification.title}
            </h3>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="rounded-md border border-white/10 bg-white/[0.03] px-2 py-0.5 font-mono text-[10px] text-ink/55">
                {repoKey(notification.repo.owner, notification.repo.name)}
              </span>
              <span className="font-mono text-[10px] text-ink/40">
                @{notification.authorLogin}
              </span>
              <span className="font-mono text-[10px] text-ink/35">
                {formatRelativeTime(notification.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:flex-col sm:items-end lg:flex-row lg:items-center">
            <span
              className={cn(
                "rounded-full border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                badge
              )}
            >
              {ASSOCIATION_LABEL[notification.authorAssociation] ??
                notification.authorAssociation}
            </span>
            <a
              href={notification.issueUrl}
              target="_blank"
              rel="noreferrer"
              className="group/btn inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-medium text-[#07080f] transition-all duration-500 hover:bg-white/90 active:scale-[0.98]"
            >
              Open issue
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-black/10 transition-transform duration-500 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-px">
                ↗
              </span>
            </a>
          </div>
        </div>
      </div>
    </motion.li>
  );
}
