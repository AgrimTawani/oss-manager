import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const notifications = await prisma.notification.findMany({
    where: { userId },
    include: { repo: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });
  return NextResponse.json(notifications);
}
