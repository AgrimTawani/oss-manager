import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseRepoInput } from "@/lib/github";

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
    const repo = await prisma.trackedRepo.create({
      data: { owner: parsed.owner, name: parsed.name, userId },
    });
    return NextResponse.json(repo, { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("Unique constraint")) {
      return NextResponse.json({ error: "Already tracking this repo" }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not add repo" }, { status: 500 });
  }
}
