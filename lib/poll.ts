import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import {
  fetchIssue,
  fetchLinkedPullRequestCount,
  fetchNewIssues,
  isMaintainerOrContributor,
} from "./github";
import { sendIssuePush } from "./push";

const METADATA_REFRESH_LIMIT = 300;
const METADATA_REFRESH_CONCURRENCY = 10;
// Issues still on the dashboard are re-checked on every 15-minute poll, so one
// that gets assigned or picks up a linked PR disappears by the next run.
const AVAILABLE_METADATA_MAX_AGE_MS = 10 * 60 * 1000;
// Closed or already-taken issues are re-checked less often, in case they are
// reopened, unassigned, or their PR link is removed.
const TAKEN_METADATA_MAX_AGE_MS = 60 * 60 * 1000;

/** Open, unassigned, no linked PR — or not yet checked. */
const AVAILABLE_ISSUE: Prisma.NotificationWhereInput = {
  AND: [
    { OR: [{ issueState: null }, { issueState: "OPEN" }] },
    { OR: [{ assigneeCount: null }, { assigneeCount: 0 }] },
    { OR: [{ linkedPullRequestCount: null }, { linkedPullRequestCount: 0 }] },
  ],
};

function staleSince(maxAgeMs: number): Prisma.NotificationWhereInput {
  return {
    OR: [
      { issueCreatedAt: null },
      { metadataUpdatedAt: null },
      { metadataUpdatedAt: { lt: new Date(Date.now() - maxAgeMs) } },
    ],
  };
}

export interface PollResult {
  reposChecked: number;
  notificationsCreated: number;
  metadataRefreshed: number;
  errors: { repo: string; message: string }[];
}

/** Keeps opportunity metadata current and repairs notifications created before
 * these fields existed. Work is capped so a large inbox cannot monopolize a run. */
async function refreshIssueMetadata(): Promise<number> {
  const select = {
    id: true,
    issueNumber: true,
    repo: {
      select: {
        owner: true,
        name: true,
        user: { select: { accessToken: true } },
      },
    },
  } satisfies Prisma.NotificationSelect;
  const orderBy: Prisma.NotificationOrderByWithRelationInput[] = [
    { metadataUpdatedAt: { sort: "asc", nulls: "first" } },
    { createdAt: "asc" },
  ];

  // Visible issues first: these are the ones that must vanish promptly.
  const available = await prisma.notification.findMany({
    where: { AND: [AVAILABLE_ISSUE, staleSince(AVAILABLE_METADATA_MAX_AGE_MS)] },
    select,
    orderBy,
    take: METADATA_REFRESH_LIMIT,
  });
  const remaining = METADATA_REFRESH_LIMIT - available.length;
  const taken = remaining > 0
    ? await prisma.notification.findMany({
        where: { AND: [{ NOT: AVAILABLE_ISSUE }, staleSince(TAKEN_METADATA_MAX_AGE_MS)] },
        select,
        orderBy,
        take: remaining,
      })
    : [];
  const notifications = [...available, ...taken];

  let refreshed = 0;
  for (let index = 0; index < notifications.length; index += METADATA_REFRESH_CONCURRENCY) {
    const batch = notifications.slice(index, index + METADATA_REFRESH_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (notification) => {
        try {
          const { owner, name, user } = notification.repo;
          const [issue, linkedPullRequestCount] = await Promise.all([
            fetchIssue(owner, name, notification.issueNumber, user.accessToken),
            fetchLinkedPullRequestCount(
              owner,
              name,
              notification.issueNumber,
              user.accessToken
            ),
          ]);
          await prisma.notification.update({
            where: { id: notification.id },
            data: {
              title: issue.title,
              issueUrl: issue.html_url,
              issueCreatedAt: new Date(issue.created_at),
              issueState: issue.state.toUpperCase(),
              assigneeCount: issue.assignees.length,
              linkedPullRequestCount,
              metadataUpdatedAt: new Date(),
            },
          });
          return 1;
        } catch (error) {
          console.error(
            `Could not refresh issue metadata for ${notification.repo.owner}/${notification.repo.name}#${notification.issueNumber}`,
            error
          );
          return 0;
        }
      })
    );
    refreshed += results.reduce<number>((total, count) => total + count, 0);
  }

  return refreshed;
}

/** Polls every tracked repo for every user and stores notifications for
 * issues opened by a maintainer, org member, collaborator, or past contributor. */
export async function pollAllRepos(): Promise<PollResult> {
  const repos = await prisma.trackedRepo.findMany({ include: { user: true } });

  let notificationsCreated = 0;
  const errors: PollResult["errors"] = [];

  for (const repo of repos) {
    try {
      const issues = await fetchNewIssues(
        repo.owner,
        repo.name,
        repo.lastSeenIssueNumber,
        repo.user.accessToken
      );

      let maxIssueNumber = repo.lastSeenIssueNumber;

      for (const issue of issues) {
        maxIssueNumber = Math.max(maxIssueNumber, issue.number);

        if (!isMaintainerOrContributor(issue.author_association)) continue;

        let linkedPullRequestCount: number | null = null;
        try {
          linkedPullRequestCount = await fetchLinkedPullRequestCount(
            repo.owner,
            repo.name,
            issue.number,
            repo.user.accessToken
          );
        } catch (error) {
          console.error(`Could not read linked PRs for ${repo.owner}/${repo.name}#${issue.number}`, error);
        }

        let created = false;
        try {
          await prisma.notification.create({
            data: {
              issueNumber: issue.number,
              issueUrl: issue.html_url,
              title: issue.title,
              authorLogin: issue.user?.login ?? "unknown",
              authorAssociation: issue.author_association,
              issueCreatedAt: new Date(issue.created_at),
              issueState: issue.state.toUpperCase(),
              assigneeCount: issue.assignees.length,
              linkedPullRequestCount,
              metadataUpdatedAt: linkedPullRequestCount === null ? null : new Date(),
              repoId: repo.id,
              userId: repo.userId,
            },
          });
          created = true;
        } catch (error) {
          if (!(error instanceof Prisma.PrismaClientKnownRequestError) || error.code !== "P2002") {
            throw error;
          }
        }

        if (created) notificationsCreated++;

        // Don't push issues that are already taken; the dashboard hides them too.
        const alreadyTaken =
          issue.assignees.length > 0 || (linkedPullRequestCount ?? 0) > 0;
        if (created && !alreadyTaken) {
          await sendIssuePush(repo.userId, {
            title: issue.title,
            body: `${repo.owner}/${repo.name} · opened by @${issue.user?.login ?? "unknown"}`,
            url: issue.html_url,
            tag: `${repo.id}:${issue.number}`,
          }).catch((error) => console.error("Could not send issue push", error));
        }
      }

      await prisma.trackedRepo.update({
        where: { id: repo.id },
        data: { lastPolledAt: new Date(), lastSeenIssueNumber: maxIssueNumber },
      });
    } catch (err) {
      errors.push({
        repo: `${repo.owner}/${repo.name}`,
        message: err instanceof Error ? err.message : "Unknown error",
      });
    }
  }

  const metadataRefreshed = await refreshIssueMetadata();
  return { reposChecked: repos.length, notificationsCreated, metadataRefreshed, errors };
}
