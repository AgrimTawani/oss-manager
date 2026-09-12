import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getVapidPublicKey } from "@/lib/push";

export async function GET() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const publicKey = getVapidPublicKey();
  if (!publicKey) {
    return NextResponse.json({ error: "Browser notifications are not configured" }, { status: 503 });
  }

  return NextResponse.json({ publicKey });
}
