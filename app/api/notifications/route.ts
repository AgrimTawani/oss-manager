import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    // Only issues confirmed ready to pick up: open, no assignee, no linked PR.
    // Anything not yet checked (null) stays hidden until the next refresh
    // confirms it. Filtering here, before `take`, keeps the newest 100 ready
    // issues instead of 100 issues that are then filtered down.
    where: {
      userId,
      issueState: "OPEN",
      assigneeCount: 0,
      linkedPullRequestCount: 0,
    },
    include: { repo: true },
    orderBy: [
      { issueCreatedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: 100,
  });
  return NextResponse.json(notifications);
}
