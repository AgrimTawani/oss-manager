import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { readyIssueWhere } from "@/lib/ready-issues";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    // Only issues ready to pick up (see readyIssueWhere). Filtering here,
    // before `take`, keeps the newest 100 ready issues instead of 100 issues
    // that are then filtered down.
    where: { AND: [{ userId }, readyIssueWhere()] },
    include: { repo: true },
    orderBy: [
      { issueCreatedAt: { sort: "desc", nulls: "last" } },
      { createdAt: "desc" },
    ],
    take: 100,
  });
  return NextResponse.json(notifications);
}
