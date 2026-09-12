import webPush from "web-push";
import { createECDH, createHmac } from "node:crypto";
import { prisma } from "./db";

export type IssuePushPayload = {
  title: string;
  body: string;
  url: string;
  tag: string;
};

type VapidConfig = { publicKey: string; privateKey: string; subject: string };
let cachedVapidConfig: VapidConfig | null | undefined;

function deriveVapidKeys(secret: string) {
  for (let counter = 0; counter < 10; counter++) {
    const privateKey = createHmac("sha256", secret)
      .update(`oss-manager-web-push-v1:${counter}`)
      .digest();
    const ecdh = createECDH("prime256v1");
    try {
      ecdh.setPrivateKey(privateKey);
      return {
        publicKey: ecdh.getPublicKey().toString("base64url"),
        privateKey: privateKey.toString("base64url"),
      };
    } catch {
      // An invalid P-256 scalar is extremely unlikely; try the next derived value.
    }
  }
  throw new Error("Could not derive a valid Web Push signing key");
}

function getVapidConfig(): VapidConfig | null {
  if (cachedVapidConfig !== undefined) return cachedVapidConfig;

  const subject = process.env.VAPID_SUBJECT || process.env.NEXTAUTH_URL;
  const explicitPublicKey = process.env.VAPID_PUBLIC_KEY;
  const explicitPrivateKey = process.env.VAPID_PRIVATE_KEY;

  if (!subject) return (cachedVapidConfig = null);

  if (explicitPublicKey && explicitPrivateKey) {
    return (cachedVapidConfig = {
      publicKey: explicitPublicKey,
      privateKey: explicitPrivateKey,
      subject,
    });
  }

  const derivationSecret = process.env.VAPID_DERIVATION_SECRET || process.env.NEXTAUTH_SECRET;
  if (!derivationSecret) return (cachedVapidConfig = null);
  const derived = deriveVapidKeys(derivationSecret);
  return (cachedVapidConfig = { ...derived, subject });
}

function configureWebPush(): boolean {
  const config = getVapidConfig();

  if (!config) return false;
  webPush.setVapidDetails(config.subject, config.publicKey, config.privateKey);
  return true;
}

export function getVapidPublicKey(): string | null {
  return getVapidConfig()?.publicKey ?? null;
}

export async function sendIssuePush(userId: string, payload: IssuePushPayload) {
  if (!configureWebPush()) {
    console.warn("Web Push skipped: VAPID environment variables are not configured");
    return;
  }

  const subscriptions = await prisma.pushSubscription.findMany({ where: { userId } });
  if (!subscriptions.length) return;

  const results = await Promise.allSettled(
    subscriptions.map((subscription) =>
      webPush.sendNotification(
        {
          endpoint: subscription.endpoint,
          keys: { p256dh: subscription.p256dh, auth: subscription.auth },
        },
        JSON.stringify(payload),
        { TTL: 60 * 60 * 6, urgency: "normal" }
      )
    )
  );

  const expiredIds: string[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") return;
    const statusCode = (result.reason as { statusCode?: number })?.statusCode;
    if (statusCode === 404 || statusCode === 410) {
      expiredIds.push(subscriptions[index].id);
    } else {
      console.error("Web Push delivery failed", {
        subscriptionId: subscriptions[index].id,
        statusCode: statusCode ?? "unknown",
      });
    }
  });

  if (expiredIds.length) {
    await prisma.pushSubscription.deleteMany({ where: { id: { in: expiredIds } } });
  }
}
