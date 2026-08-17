"use client";

import Image from "next/image";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid";

function FilterHeader() {
  return (
    <div className="flex h-full min-h-[6rem] w-full flex-col gap-2 rounded-lg bg-gradient-to-br from-accent/10 to-transparent p-4 font-mono text-xs">
      <span className="text-accent">author_association</span>
      <div className="flex flex-wrap gap-1.5">
        {["OWNER", "MEMBER", "COLLABORATOR", "CONTRIBUTOR"].map((tag) => (
          <span
            key={tag}
            className="rounded-md border border-accent/20 bg-accent/10 px-2 py-0.5 text-[10px] text-accent"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

function PollingHeader() {
  return (
    <div className="flex h-full min-h-[6rem] flex-col justify-center rounded-lg border border-dashed border-line bg-white/[0.02] p-4 font-mono text-[11px] text-ink/50">
      <span>GitHub Actions cron</span>
      <span className="mt-2 text-accent">*/15 * * * *</span>
      <span className="mt-1 text-ink/35">POST /api/poll</span>
    </div>
  );
}

function FeedHeader() {
  return (
    <div className="space-y-2 rounded-lg bg-white/[0.02] p-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-2">
          <div className={`h-1.5 w-1.5 rounded-full ${i === 1 ? "bg-accent" : "bg-ink/20"}`} />
          <div className="h-2 flex-1 rounded bg-ink/10" style={{ width: `${100 - i * 15}%` }} />
        </div>
      ))}
    </div>
  );
}

function DatabaseHeader() {
  return (
    <div className="flex h-full min-h-[6rem] items-center justify-center rounded-lg bg-white/[0.02] p-4">
      <svg viewBox="0 0 120 60" className="h-16 w-full text-ink/30" aria-hidden="true">
        <ellipse cx="60" cy="15" rx="50" ry="12" fill="none" stroke="currentColor" strokeWidth="1" />
        <path d="M10 15 v20 q0 12 50 12 q50 0 50 -12 v-20" fill="none" stroke="currentColor" strokeWidth="1" />
        <ellipse cx="60" cy="35" rx="50" ry="12" fill="none" stroke="currentColor" strokeWidth="1" />
        <text x="60" y="38" textAnchor="middle" fill="currentColor" fontSize="8" fontFamily="monospace">
          Neon
        </text>
      </svg>
    </div>
  );
}

function ContributorHeader() {
  return (
    <div className="relative h-full min-h-[8rem] overflow-hidden rounded-lg">
      <Image
        src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&q=80"
        alt=""
        fill
        className="object-cover opacity-40"
        sizes="400px"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-surface-raised via-surface-raised/60 to-transparent" />
    </div>
  );
}

export function FeaturesBento() {
  return (
    <section className="px-4 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink/40">Features</span>
          <h2 className="mt-3 font-display text-3xl tracking-[-0.02em] text-ink md:text-4xl">
            Built for contributors who hate noise
          </h2>
        </div>

        <BentoGrid>
          <BentoGridItem
            title="Smart association filter"
            description="We use GitHub's author_association field to ignore drive-by issues from first-time reporters."
            header={<FilterHeader />}
            className="md:col-span-2"
          />
          <BentoGridItem
            title="Scheduled polling"
            description="GitHub Actions hits your app every 15 minutes. No webhook setup required."
            header={<PollingHeader />}
            className="md:col-span-1"
          />
          <BentoGridItem
            title="In-app feed"
            description="Notifications mark as read on hover. Click through to the issue on GitHub instantly."
            header={<FeedHeader />}
            className="md:col-span-1"
          />
          <BentoGridItem
            title="Persistent storage"
            description="Tracked repos and notification history live in Neon Postgres — dev and prod."
            header={<DatabaseHeader />}
            className="md:col-span-1"
          />
          <BentoGridItem
            title="Built for contributors"
            description="Track the projects you want to ship PRs to. Focus on issues that matter from people who maintain the codebase."
            header={<ContributorHeader />}
            className="md:col-span-2 md:row-span-1"
          />
        </BentoGrid>
      </div>
    </section>
  );
}
