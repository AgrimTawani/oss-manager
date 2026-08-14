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
  user: { login: string } | null;
  author_association: string;
  pull_request?: unknown; // present when the "issue" is actually a PR
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
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const res = await fetch(
    `https://api.github.com/repos/${owner}/${name}/issues?state=open&sort=created&direction=desc&per_page=50`,
    { headers, cache: "no-store" }
  );

  if (res.status === 404) {
    throw new Error(`Repo ${owner}/${name} not found or private without access`);
  }
  if (!res.ok) {
    throw new Error(`GitHub API error for ${owner}/${name}: ${res.status} ${res.statusText}`);
  }

  const issues: GithubIssue[] = await res.json();

  // The issues endpoint also returns PRs; exclude those, and stop once we
  // reach issues we've already seen (list is sorted newest-created-first).
  return issues.filter((issue) => !issue.pull_request && issue.number > sinceIssueNumber);
}
