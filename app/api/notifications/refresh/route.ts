import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { refreshUserInbox } from "@/lib/poll";

export const maxDuration = 60;

/** Called by an open dashboard so the signed-in user's inbox stays current
 * even when the scheduled poll is delayed. Cheap when nothing is stale. */
export async function POST() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id?: string } | undefined)?.id;
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const result = await refreshUserInbox(userId);
  return NextResponse.json({
    reposChecked: result.reposChecked,
    notificationsCreated: result.notificationsCreated,
    metadataRefreshed: result.metadataRefreshed,
    githubAccessExpired: result.githubAccessExpired,
    hasMore: result.hasMore,
  });
}
