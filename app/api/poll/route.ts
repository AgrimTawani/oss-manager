import { NextResponse } from "next/server";
import { pollAllRepos } from "@/lib/poll";

export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  const expected = `Bearer ${process.env.POLL_SECRET}`;

  if (!process.env.POLL_SECRET || authHeader !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const result = await pollAllRepos();
  return NextResponse.json(result);
}
