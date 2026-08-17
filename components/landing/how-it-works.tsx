"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  {
    number: "01",
    title: "Add a repo",
    description:
      "Paste any public GitHub repo URL or owner/name. We start tracking its issue stream immediately.",
  },
  {
    number: "02",
    title: "We poll GitHub",
    description:
      "Every 15 minutes, we check for new issues and read each author's association with the repo.",
  },
  {
    number: "03",
    title: "Get the signal",
    description:
      "Only issues from owners, members, collaborators, and contributors become notifications in your feed.",
  },
];

export function HowItWorks() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setVisible(true);
      },
      { threshold: 0.2 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how-it-works" ref={ref} className="px-4 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 max-w-2xl">
          <span className="text-[10px] uppercase tracking-[0.2em] text-ink/40">Process</span>
          <h2 className="mt-3 font-display text-3xl tracking-[-0.02em] text-ink md:text-4xl">
            Three steps to a cleaner issue feed
          </h2>
        </div>

        <div className="grid gap-8 md:grid-cols-3 md:gap-6">
          {STEPS.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 16 }}
              animate={visible ? { opacity: 1, y: 0 } : {}}
              transition={{
                delay: index * 0.12,
                duration: 0.7,
                ease: [0.32, 0.72, 0, 1],
              }}
              className="relative rounded-[1.25rem] border border-line bg-surface-raised p-8"
            >
              <span className="font-mono text-4xl font-medium text-accent/30">{step.number}</span>
              <h3 className="mt-4 text-lg font-medium text-ink">{step.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-ink/55">{step.description}</p>
              {index < STEPS.length - 1 && (
                <div
                  className="absolute -right-3 top-1/2 hidden h-px w-6 bg-line md:block"
                  aria-hidden="true"
                />
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
