export interface TrackedRepo {
  id: string;
  owner: string;
  name: string;
  lastPolledAt: string | null;
  addedAt?: string;
}

export interface NotificationItem {
  id: string;
  issueNumber: number;
  title: string;
  issueUrl: string;
  authorLogin: string;
  authorAssociation: string;
  issueCreatedAt: string | null;
  issueState: "OPEN" | "CLOSED" | null;
  assigneeCount: number | null;
  linkedPullRequestCount: number | null;
  metadataUpdatedAt: string | null;
  createdAt: string;
  read: boolean;
  repo: { owner: string; name: string };
}

export type FeedFilter = "all" | "unread";
export type IssueStateFilter = "any" | "open" | "closed";
export type AssignmentFilter = "any" | "unassigned" | "assigned";
export type PullRequestFilter = "any" | "none" | "linked";
export type SortOrder = "newest" | "oldest";

export interface OrganizationSummary {
  owner: string;
  repoCount: number;
  issueCount: number;
  unreadCount: number;
}

export const ASSOCIATION_LABEL: Record<string, string> = {
  OWNER: "Owner",
  MEMBER: "Org member",
  COLLABORATOR: "Collaborator",
  CONTRIBUTOR: "Past contributor",
};

export const ASSOCIATION_STRIPE: Record<string, string> = {
  OWNER: "bg-violet-400",
  MEMBER: "bg-blue-400",
  COLLABORATOR: "bg-emerald-400",
  CONTRIBUTOR: "bg-amber-400",
};

export const ASSOCIATION_BADGE: Record<string, string> = {
  OWNER: "bg-violet-500/15 text-violet-300 border-violet-500/20",
  MEMBER: "bg-blue-500/15 text-blue-300 border-blue-500/20",
  COLLABORATOR: "bg-emerald-500/15 text-emerald-300 border-emerald-500/20",
  CONTRIBUTOR: "bg-amber-500/15 text-amber-300 border-amber-500/20",
};

export function repoKey(owner: string, name: string) {
  return `${owner}/${name}`;
}
