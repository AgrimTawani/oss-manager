import { prisma } from "./db";
import { fetchNewIssues, isMaintainerOrContributor } from "./github";

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

        await prisma.notification.upsert({
          where: { repoId_issueNumber: { repoId: repo.id, issueNumber: issue.number } },
          update: {},
          create: {
            issueNumber: issue.number,
            issueUrl: issue.html_url,
            title: issue.title,
            authorLogin: issue.user?.login ?? "unknown",
            authorAssociation: issue.author_association,
            repoId: repo.id,
            userId: repo.userId,
          },
        });
        notificationsCreated++;
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
