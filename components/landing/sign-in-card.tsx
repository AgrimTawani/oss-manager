"use client";

import { signIn } from "next-auth/react";

export function SignInCard() {
  return (
    <div>
      <button type="button" onClick={() => signIn("github", { callbackUrl: "/dashboard" })} className="inline-flex h-11 items-center gap-2.5 bg-primary px-5 text-sm font-semibold text-canvas hover:bg-primary/90">
        <svg viewBox="0 0 16 16" className="h-4 w-4 fill-current" aria-hidden="true"><path d="M8 0a8 8 0 0 0-2.53 15.59c.4.07.55-.17.55-.38v-1.49c-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.18.82A7.4 7.4 0 0 1 8 3.86c.68 0 1.36.09 2 .27 1.51-1.04 2.18-.82 2.18-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.15.46.55.38A8 8 0 0 0 8 0Z" /></svg>
        Start tracking repositories
      </button>
      <p className="mt-3 text-xs text-muted">Free and open source. Uses your GitHub account to read repository issues.</p>
    </div>
  );
}
