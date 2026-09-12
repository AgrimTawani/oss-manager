// Associations that count as "official" for notification purposes.
// See: https://docs.github.com/en/graphql/reference/enums#commentauthorassociation
export const MAINTAINER_ASSOCIATIONS = new Set([
  "OWNER",
  "MEMBER",
  "COLLABORATOR",
  "CONTRIBUTOR",
]);

export function isMaintainerOrContributor(authorAssociation: string): boolean {
  return MAINTAINER_ASSOCIATIONS.has(authorAssociation);
}

/** Accepts a full GitHub URL or "owner/name" shorthand and returns { owner, name }. */
export function parseRepoInput(input: string): { owner: string; name: string } | null {
  const trimmed = input.trim().replace(/\.git$/, "").replace(/\/$/, "");

  // owner/name shorthand
  const shorthandMatch = trimmed.match(/^([\w.-]+)\/([\w.-]+)$/);
  if (shorthandMatch) {
    return { owner: shorthandMatch[1], name: shorthandMatch[2] };
  }

  // full URL
  try {
    const url = new URL(trimmed);
    if (url.hostname !== "github.com") return null;
    const parts = url.pathname.split("/").filter(Boolean);
    if (parts.length < 2) return null;
    return { owner: parts[0], name: parts[1] };
  } catch {
    return null;
  }
}

export interface GithubIssue {
  number: number;
  html_url: string;
  title: string;
  created_at: string;
  state: "open" | "closed";
  assignees: { login: string }[];
  user: { login: string } | null;
  author_association: string;
  pull_request?: unknown; // present when the "issue" is actually a PR
}

function githubHeaders(accessToken?: string): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  return headers;
}

function githubIssueError(owner: string, name: string, status: number, statusText: string) {
  if (status === 404) {
    return new Error(`Repo ${owner}/${name} not found or private without access`);
  }
  return new Error(`GitHub API error for ${owner}/${name}: ${status} ${statusText}`);
}

/**
 * Fetches issues opened after `sinceIssueNumber`, newest first from the API,
 * using a personal access token if provided (raises rate limits and allows private repos).
 */
export async function fetchNewIssues(
  owner: string,
  name: string,
  sinceIssueNumber: number,
  accessToken?: string
): Promise<GithubIssue[]> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/issues?state=open&sort=created&direction=desc&per_page=50`,
    { headers: githubHeaders(accessToken), cache: "no-store" }
  );

  if (!res.ok) {
    throw githubIssueError(owner, name, res.status, res.statusText);
  }

  const issues: GithubIssue[] = await res.json();

  // The issues endpoint also returns PRs; exclude those, and stop once we
  // reach issues we've already seen (list is sorted newest-created-first).
  return issues.filter((issue) => !issue.pull_request && issue.number > sinceIssueNumber);
}

/** Fetches one issue exactly. Used to repair notifications created before
 * GitHub's issue creation timestamp was stored. */
export async function fetchIssue(
  owner: string,
  name: string,
  issueNumber: number,
  accessToken?: string
): Promise<GithubIssue> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/issues/${issueNumber}`,
    { headers: githubHeaders(accessToken), cache: "no-store" }
  );

  if (!res.ok) {
    throw githubIssueError(owner, name, res.status, res.statusText);
  }

  return res.json();
}

type GithubTimelineEvent = {
  event?: string;
  source?: {
    issue?: {
      html_url?: string;
      pull_request?: unknown;
    };
  };
};

/** Counts unique pull requests that GitHub reports as cross-referencing an
 * issue. This is the same relationship surfaced in an issue's timeline. */
export async function fetchLinkedPullRequestCount(
  owner: string,
  name: string,
  issueNumber: number,
  accessToken?: string
): Promise<number> {
  const linkedPullRequests = new Set<string>();

  for (let page = 1; page <= 5; page++) {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${name}/issues/${issueNumber}/timeline?per_page=100&page=${page}`,
      { headers: githubHeaders(accessToken), cache: "no-store" }
    );

    if (!res.ok) {
      throw githubIssueError(owner, name, res.status, res.statusText);
    }

    const events: GithubTimelineEvent[] = await res.json();
    for (const event of events) {
      const sourceIssue = event.event === "cross-referenced" ? event.source?.issue : undefined;
      if (sourceIssue?.pull_request) {
        linkedPullRequests.add(sourceIssue.html_url ?? `unknown:${page}:${linkedPullRequests.size}`);
      }
    }

    if (events.length < 100) break;
  }

  return linkedPullRequests.size;
}

/** Returns the current repository-wide issue/PR sequence number so a newly
 * tracked repo starts watching from now instead of importing its history. */
export async function fetchLatestIssueNumber(
  owner: string,
  name: string,
  accessToken?: string
): Promise<number> {
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/issues?state=all&sort=created&direction=desc&per_page=1`,
    { headers: githubHeaders(accessToken), cache: "no-store" }
  );

  if (!res.ok) {
    throw githubIssueError(owner, name, res.status, res.statusText);
  }

  const issues: GithubIssue[] = await res.json();
  return issues[0]?.number ?? 0;
}
