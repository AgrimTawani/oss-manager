import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type SubscriptionBody = {
  endpoint?: unknown;
  keys?: { p256dh?: unknown; auth?: unknown };
};

async function getUserId() {
  const session = await getServerSession(authOptions);
  return (session?.user as { id?: string } | undefined)?.id;
}

function validSubscription(body: SubscriptionBody) {
  if (
    typeof body.endpoint !== "string" ||
    typeof body.keys?.p256dh !== "string" ||
    typeof body.keys.auth !== "string" ||
    body.endpoint.length > 2048 ||
    body.keys.p256dh.length > 512 ||
    body.keys.auth.length > 512
  ) return false;

  try {
    return new URL(body.endpoint).protocol === "https:";
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let body: SubscriptionBody;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  if (!validSubscription(body)) {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.upsert({
    where: { endpoint: body.endpoint as string },
    update: {
      p256dh: body.keys!.p256dh as string,
      auth: body.keys!.auth as string,
      userId,
    },
    create: {
      endpoint: body.endpoint as string,
      p256dh: body.keys!.p256dh as string,
      auth: body.keys!.auth as string,
      userId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

export async function DELETE(req: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  let endpoint: unknown;
  try {
    endpoint = (await req.json()).endpoint;
  } catch {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  if (typeof endpoint !== "string") {
    return NextResponse.json({ error: "Invalid subscription" }, { status: 400 });
  }

  await prisma.pushSubscription.deleteMany({ where: { endpoint, userId } });
  return NextResponse.json({ ok: true });
}
