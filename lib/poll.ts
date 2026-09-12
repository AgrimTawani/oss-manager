import { prisma } from "./db";
import { Prisma } from "@prisma/client";
import { fetchNewIssues, isMaintainerOrContributor } from "./github";
import { sendIssuePush } from "./push";

export interface PollResult {
  reposChecked: number;
  notificationsCreated: number;
  errors: { repo: string; message: string }[];
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

  return { reposChecked: repos.length, notificationsCreated, errors };
}
