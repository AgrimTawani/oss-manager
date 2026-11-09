import type { Prisma } from "@prisma/client";

/** Issues opened longer ago than this are never shown or re-checked. */
export const READY_ISSUE_MAX_AGE_DAYS = 14;

function readyIssueCutoff() {
  return new Date(Date.now() - READY_ISSUE_MAX_AGE_DAYS * 24 * 60 * 60 * 1000);
}

/** The single definition of an issue the dashboard shows: confirmed open,
 * unassigned, with no linked PR, and opened within the last two weeks.
 * Unchecked (null) values never match, so unconfirmed issues stay hidden. */
export function readyIssueWhere(): Prisma.NotificationWhereInput {
  return {
    issueState: "OPEN",
    assigneeCount: 0,
    linkedPullRequestCount: 0,
    issueCreatedAt: { gte: readyIssueCutoff() },
  };
}

/** Issues young enough to be worth re-checking. A null creation time is a
 * legacy row; it is checked once so its real age becomes known. */
export function recentIssueWhere(): Prisma.NotificationWhereInput {
  return {
    OR: [{ issueCreatedAt: null }, { issueCreatedAt: { gte: readyIssueCutoff() } }],
  };
}
