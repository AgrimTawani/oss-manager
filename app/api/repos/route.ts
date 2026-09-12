import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { Prisma } from "@prisma/client";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { fetchLatestIssueNumber, parseRepoInput } from "@/lib/github";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const repos = await prisma.trackedRepo.findMany({
    where: { userId },
    orderBy: { addedAt: "desc" },
  });
  return NextResponse.json(repos);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await req.json();
  const parsed = parseRepoInput(body.repo ?? "");
  if (!parsed) {
    return NextResponse.json(
      { error: "Enter a GitHub URL or owner/name, e.g. facebook/react" },
      { status: 400 }
    );
  }

  try {
    const existingRepo = await prisma.trackedRepo.findUnique({
      where: { userId_owner_name: { userId, owner: parsed.owner, name: parsed.name } },
      select: { id: true },
    });
    if (existingRepo) {
      return NextResponse.json({ error: "Already tracking this repo" }, { status: 409 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { accessToken: true },
    });
    if (!user) {
      return NextResponse.json({ error: "Account not found. Please sign in again." }, { status: 401 });
    }

    const lastSeenIssueNumber = await fetchLatestIssueNumber(
      parsed.owner,
      parsed.name,
      user.accessToken
    );
    const repo = await prisma.trackedRepo.create({
      data: { owner: parsed.owner, name: parsed.name, userId, lastSeenIssueNumber },
    });
    return NextResponse.json(repo, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return NextResponse.json({ error: "Already tracking this repo" }, { status: 409 });
    }
    if (err instanceof Error && err.message.includes("not found or private")) {
      return NextResponse.json({ error: err.message }, { status: 404 });
    }
    return NextResponse.json({ error: "Could not add repo" }, { status: 500 });
  }
}
