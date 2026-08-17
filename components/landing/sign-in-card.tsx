"use client";

import { signIn } from "next-auth/react";
import { cn } from "@/lib/utils";

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.18.82.63-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.51-1.04 2.18-.82 2.18-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
    </svg>
  );
}

const TRUST_LINES = [
  "Only maintainer and contributor issues surface",
  "Your GitHub token stays encrypted at rest",
  "Free to use — built for open source contributors",
];

export function SignInCard({ className }: { className?: string }) {
  return (
    <div className={cn("relative", className)}>
      <div className="rounded-[1.75rem] bg-white/[0.03] p-1.5 ring-1 ring-white/10">
        <div className="rounded-[calc(1.75rem-0.375rem)] bg-surface-raised px-6 py-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <p className="text-[10px] uppercase tracking-[0.2em] font-medium text-ink/40 mb-4">
            Continue with GitHub
          </p>

          <button
            type="button"
            onClick={() => signIn("github", { callbackUrl: "/dashboard" })}
            className="group flex w-full items-center justify-center gap-3 rounded-full bg-github px-6 py-3.5 text-sm font-medium text-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:bg-github-hover active:scale-[0.98]"
          >
            <GitHubIcon className="h-5 w-5" />
            Sign in with GitHub
            <span className="ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black/20 transition-transform duration-700 group-hover:translate-x-0.5 group-hover:-translate-y-px">
              <span aria-hidden="true" className="text-xs">
                ↗
              </span>
            </span>
          </button>

          <p className="mt-4 text-xs text-ink/40 leading-relaxed">
            Requires <code className="font-mono text-ink/55">read:user</code> and{" "}
            <code className="font-mono text-ink/55">repo</code> scopes to read issues on
            repos you track.
          </p>

          <ul className="mt-6 space-y-3 border-t border-line pt-6">
            {TRUST_LINES.map((line) => (
              <li key={line} className="flex items-start gap-2.5 text-sm text-ink/60">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                {line}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
