"use client";

import { cn, formatRelativeTime } from "@/lib/utils";
import { ASSOCIATION_LABEL, repoKey } from "./types";
import type { NotificationItem } from "./types";

const ASSOCIATION_TONE: Record<string, string> = {
  OWNER: "border-purple-400/25 bg-purple-400/10 text-purple-300",
  MEMBER: "border-blue-400/25 bg-blue-400/10 text-blue-300",
  COLLABORATOR: "border-cyan-400/25 bg-cyan-400/10 text-cyan-300",
  CONTRIBUTOR: "border-amber-400/25 bg-amber-400/10 text-amber-300",
};

export function NotificationCard({
  notification, onMarkRead,
}: {
  notification: NotificationItem;
  onMarkRead: (id: string) => void;
}) {
  const repository = repoKey(notification.repo.owner, notification.repo.name);
  const timestamp = notification.issueCreatedAt ?? notification.createdAt;
  const timestampLabel = notification.issueCreatedAt ? "opened" : "discovered";

  return (
    <li className={cn("group grid gap-3 border-b border-border px-4 py-4 last:border-b-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:px-5", notification.read ? "bg-canvas" : "bg-unread")}>
      <div className="flex min-w-0 gap-3">
        <button
          type="button"
          onClick={() => onMarkRead(notification.id)}
          disabled={notification.read}
          aria-label={notification.read ? "Issue has been read" : "Mark issue as read"}
          title={notification.read ? "Read" : "Mark as read"}
          className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <span className={cn("h-2 w-2 rounded-full", notification.read ? "bg-border" : "bg-accent")} />
        </button>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted">
            <span className="font-medium text-secondary">{repository}</span>
            <span>#{notification.issueNumber}</span>
            <span title={new Date(timestamp).toLocaleString()}>
              {timestampLabel} {formatRelativeTime(timestamp)}
            </span>
          </div>
          <a href={notification.issueUrl} target="_blank" rel="noreferrer" onClick={() => onMarkRead(notification.id)} className="mt-1.5 block text-[15px] font-medium leading-6 text-primary hover:text-accent hover:underline hover:underline-offset-4">
            {notification.title}
          </a>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>by @{notification.authorLogin}</span>
            <span className={cn("border px-1.5 py-0.5 text-[10px] font-medium", ASSOCIATION_TONE[notification.authorAssociation] ?? "border-border bg-subtle text-secondary")}>
              {ASSOCIATION_LABEL[notification.authorAssociation] ?? notification.authorAssociation}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 pl-8 sm:pl-0">
        {!notification.read ? (
          <button type="button" onClick={() => onMarkRead(notification.id)} className="px-2 py-1.5 text-xs text-muted hover:bg-subtle hover:text-primary">
            Mark read
          </button>
        ) : null}
        <a href={notification.issueUrl} target="_blank" rel="noreferrer" onClick={() => onMarkRead(notification.id)} aria-label={`Open ${notification.title} on GitHub`} className="inline-flex h-8 items-center gap-1.5 border border-border bg-panel px-2.5 text-xs font-medium text-secondary hover:border-primary/20 hover:bg-subtle hover:text-primary">
          GitHub <span aria-hidden="true">↗</span>
        </a>
      </div>
    </li>
  );
}
