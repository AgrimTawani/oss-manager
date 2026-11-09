import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    // Issues someone is already working on (assigned, or with a linked PR) are
    // never shown. Filtering here, before `take`, keeps the newest 100
    // *available* issues instead of 100 issues that are then filtered down.
    // Null means "not checked yet" (e.g. GitHub was briefly unreachable); those
    // stay visible until the next metadata refresh fills them in.
    where: {
      userId,
      AND: [
        { OR: [{ assigneeCount: null }, { assigneeCount: 0 }] },
        { OR: [{ linkedPullRequestCount: null }, { linkedPullRequestCount: 0 }] },
      ],
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
