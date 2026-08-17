"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Spotlight } from "@/components/ui/spotlight";
import { BackgroundBeams } from "@/components/ui/background-beams";
import { cn } from "@/lib/utils";

const SAMPLE_NOTIFICATIONS = [
  {
    repo: "vercel/next.js",
    title: "App Router: streaming SSR edge case",
    author: "leerob",
    badge: "Contributor",
    delay: 0,
  },
  {
    repo: "facebook/react",
    title: "Concurrent features docs update needed",
    author: "gaearon",
    badge: "Owner",
    delay: 0.15,
  },
  {
    repo: "prisma/prisma",
    title: "Migration path for v6 breaking changes",
    author: "janpio",
    badge: "Member",
    delay: 0.3,
  },
];

const TRACKED_REPOS = ["vercel/next.js", "prisma/prisma", "tailwindlabs/tailwindcss"];

export function NotificationArtPanel({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative min-h-[420px] lg:min-h-[600px] overflow-hidden rounded-[2rem] border border-line bg-surface",
        className
      )}
    >
      <Spotlight className="-top-40 left-0 md:-top-20 md:left-60" fill="#3457d5" />
      <BackgroundBeams />

      <div className="absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1200&q=80"
          alt=""
          fill
          className="object-cover opacity-[0.12]"
          priority
          sizes="(max-width: 1024px) 100vw, 50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-paper/80 via-paper/40 to-transparent" />
      </div>

      <div className="relative z-10 flex h-full flex-col p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {TRACKED_REPOS.map((repo, i) => (
            <motion.span
              key={repo}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.1, duration: 0.6 }}
              className="rounded-full border border-line bg-white/[0.04] px-3 py-1 font-mono text-[11px] text-ink/70"
            >
              {repo}
            </motion.span>
          ))}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3">
          {SAMPLE_NOTIFICATIONS.map((notif) => (
            <motion.div
              key={notif.title}
              initial={{ opacity: 0, x: 24, y: 12 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{
                delay: 0.6 + notif.delay,
                duration: 0.8,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="rounded-[1.25rem] border border-line bg-white/[0.04] p-4 backdrop-blur-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-ink">{notif.title}</p>
                  <p className="mt-1 font-mono text-[11px] text-ink/45">
                    {notif.repo} · {notif.author}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-accent/15 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
                  {notif.badge}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="mt-6 text-center font-mono text-[10px] uppercase tracking-[0.15em] text-ink/35"
        >
          Live preview · filtered notifications only
        </motion.p>
      </div>
    </div>
  );
}
