"use client";

import { useEffect, useState } from "react";

type PushState = "checking" | "unsupported" | "blocked" | "disabled" | "enabled";

async function saveSubscription(subscription: PushSubscription) {
  const response = await fetch("/api/push/subscriptions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });
  if (!response.ok) throw new Error("This browser could not be registered.");
}

function urlBase64ToUint8Array(value: string) {
  const padding = "=".repeat((4 - (value.length % 4)) % 4);
  const base64 = (value + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((character) => character.charCodeAt(0)));
}

async function registerServiceWorker() {
  await navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" });
  return navigator.serviceWorker.ready;
}

async function isBraveBrowser() {
  const brave = (navigator as Navigator & { brave?: { isBrave?: () => Promise<boolean> } }).brave;
  try {
    return Boolean(await brave?.isBrave?.());
  } catch {
    return false;
  }
}

function friendlyPushError(caught: unknown, isBrave: boolean) {
  const message = caught instanceof Error ? caught.message : "";
  if (/push service error/i.test(message) || (caught instanceof DOMException && caught.name === "AbortError")) {
    if (isBrave) {
      return "Brave push messaging is off. Enable ‘Use Google services for push messaging’ in Settings → Privacy and security, then retry.";
    }
    return "This browser's push service is unavailable. Open OSS Manager in Chrome, Edge, Firefox, or Safari.";
  }
  if (/permission/i.test(message)) {
    return "Notification permission was not granted. Check this site's browser settings.";
  }
  return message || "Could not enable notifications on this browser.";
}

export function PushNotificationControl() {
  const [state, setState] = useState<PushState>("checking");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!window.isSecureContext || !("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
      setState("unsupported");
      return;
    }
    if (Notification.permission === "denied") {
      setState("blocked");
      return;
    }

    registerServiceWorker().then(async (registration) => {
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) await saveSubscription(subscription);
      setState(subscription ? "enabled" : "disabled");
    }).catch(() => {
      setState("disabled");
      setError("Notification setup could not be checked.");
    });
  }, []);

  async function enable() {
    setBusy(true);
    setError(null);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setState(permission === "denied" ? "blocked" : "disabled");
        return;
      }

      const keyResponse = await fetch("/api/push/public-key");
      if (!keyResponse.ok) throw new Error("Notifications are not configured on the server.");
      const { publicKey } = await keyResponse.json();
      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      if (applicationServerKey.length !== 65 || applicationServerKey[0] !== 4) {
        throw new Error("The server returned an invalid notification key.");
      }

      let registration = await registerServiceWorker();
      const subscription =
        (await registration.pushManager.getSubscription()) ||
        (await (async () => {
          try {
            return await registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
          } catch (firstError) {
            if (!(firstError instanceof DOMException) || firstError.name !== "AbortError") {
              throw firstError;
            }

            // A stale registration can make Chromium reject a valid push
            // subscription. Re-register once before surfacing a browser error.
            await registration.unregister();
            registration = await registerServiceWorker();
            return registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey,
            });
          }
        })());

      await saveSubscription(subscription);
      setState("enabled");
    } catch (caught) {
      setError(friendlyPushError(caught, await isBraveBrowser()));
    } finally {
      setBusy(false);
    }
  }

  async function disable() {
    setBusy(true);
    setError(null);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      if (subscription) {
        const response = await fetch("/api/push/subscriptions", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: subscription.endpoint }),
        });
        if (!response.ok) throw new Error("Could not remove this browser.");
        await subscription.unsubscribe();
      }
      setState("disabled");
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Could not disable notifications.");
    } finally {
      setBusy(false);
    }
  }

  if (state === "unsupported") {
    return <p className="px-2 text-xs leading-5 text-muted">Browser alerts are not supported here.</p>;
  }
  if (state === "blocked") {
    return <p className="px-2 text-xs leading-5 text-warning">Notifications are blocked in your browser settings.</p>;
  }

  return (
    <div className="border-t border-border px-2 pt-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-secondary">Browser alerts</p>
          <p className="mt-0.5 text-[11px] text-muted">
            {state === "enabled" ? "Enabled on this device" : "Get notified when issues arrive"}
          </p>
        </div>
        <button type="button" onClick={state === "enabled" ? disable : enable} disabled={busy || state === "checking"} className="border border-border bg-panel px-2.5 py-1.5 text-[11px] font-medium text-secondary hover:bg-subtle hover:text-primary disabled:opacity-50">
          {busy || state === "checking" ? "…" : state === "enabled" ? "Disable" : "Enable"}
        </button>
      </div>
      {error ? <p className="mt-2 text-[11px] leading-4 text-danger">{error}</p> : null}
    </div>
  );
}
