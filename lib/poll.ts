import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import { fetchIssue, fetchNewIssues, isMaintainerOrContributor } from "./github";
import { sendIssuePush } from "./push";

const TIMESTAMP_BACKFILL_LIMIT = 100;
const TIMESTAMP_BACKFILL_CONCURRENCY = 10;

export interface PollResult {
  reposChecked: number;
  notificationsCreated: number;
  timestampsBackfilled: number;
  errors: { repo: string; message: string }[];
}

/** Repairs notifications imported before issueCreatedAt was introduced.
 * Work is capped per run so a large account cannot monopolize the poll job. */
async function backfillIssueCreatedAt(): Promise<number> {
  const notifications = await prisma.notification.findMany({
    where: { issueCreatedAt: null },
    select: {
      id: true,
      issueNumber: true,
      repo: {
        select: {
          owner: true,
          name: true,
          user: { select: { accessToken: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
    take: TIMESTAMP_BACKFILL_LIMIT,
  });

  let backfilled = 0;
  for (let index = 0; index < notifications.length; index += TIMESTAMP_BACKFILL_CONCURRENCY) {
    const batch = notifications.slice(index, index + TIMESTAMP_BACKFILL_CONCURRENCY);
    const results = await Promise.all(
      batch.map(async (notification) => {
        try {
          const issue = await fetchIssue(
            notification.repo.owner,
            notification.repo.name,
            notification.issueNumber,
            notification.repo.user.accessToken
          );
          const result = await prisma.notification.updateMany({
            where: { id: notification.id, issueCreatedAt: null },
            data: { issueCreatedAt: new Date(issue.created_at) },
          });
          return result.count;
        } catch (error) {
          console.error(
            `Could not backfill issue timestamp for ${notification.repo.owner}/${notification.repo.name}#${notification.issueNumber}`,
            error
          );
          return 0;
        }
      })
    );
    backfilled += results.reduce((total, count) => total + count, 0);
  }

  return backfilled;
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

        if (created) {
          notificationsCreated++;
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

  const timestampsBackfilled = await backfillIssueCreatedAt();
  return { reposChecked: repos.length, notificationsCreated, timestampsBackfilled, errors };
}
