"use client";

import { motion } from "framer-motion";
import { HeroHighlight, LampContainer } from "@/components/ui/lamp";
import { SignInCard } from "./sign-in-card";
import { NotificationArtPanel } from "./notification-art-panel";

export function HeroSplit() {
  return (
    <section className="relative min-h-[100dvh] overflow-hidden px-4 pb-16 pt-28 lg:px-8 lg:pb-24 lg:pt-32">

      <div className="relative mx-auto max-w-7xl">
        <div className="mb-8 lg:hidden">
          <LampContainer className="min-h-[6rem]">
            <span className="font-display text-2xl text-ink/90">OSS Contribution Manager</span>
          </LampContainer>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
            className="flex flex-col"
          >
            <span className="mb-6 inline-flex w-fit rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-ink/50">
              Open source · GitHub native
            </span>

            <h1 className="max-w-2xl font-display text-[clamp(2.25rem,5vw,3.75rem)] leading-[1.08] tracking-[-0.02em] text-ink">
              Hear from{" "}
              <HeroHighlight>maintainers</HeroHighlight>, not the noise.
            </h1>

            <p className="mt-6 max-w-lg text-base leading-relaxed text-ink/55 md:text-lg">
              Track the repos you want to contribute to. Get notified only when an owner,
              org member, collaborator, or past contributor opens a new issue — never random
              drive-by reports from strangers.
            </p>

            <div className="mt-10 max-w-md">
              <SignInCard />
            </div>

            <a
              href="#how-it-works"
              className="mt-8 inline-flex items-center gap-2 text-sm text-ink/45 transition-colors duration-300 hover:text-ink/70"
            >
              See how it works
              <span aria-hidden="true">↓</span>
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          >
            <NotificationArtPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
