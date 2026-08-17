"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LampContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex min-h-[8rem] flex-col items-center justify-center overflow-hidden rounded-md bg-paper w-full z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0">
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="absolute inset-auto right-1/2 h-56 overflow-visible w-[30rem] [background:conic-gradient(from_70deg_at_center_top,#3457d5,transparent,transparent)] text-white"
        >
          <div className="absolute w-[100%] left-0 bg-paper h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-40 h-[100%] left-0 bg-paper bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>
        <motion.div
          initial={{ opacity: 0.5, width: "15rem" }}
          whileInView={{ opacity: 1, width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="absolute inset-auto left-1/2 h-56 w-[30rem] [background:conic-gradient(from_290deg_at_center_top,transparent,transparent,#3457d5)] text-white"
        >
          <div className="absolute w-40 h-[100%] right-0 bg-paper bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-paper h-40 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-paper blur-2xl" />
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-accent opacity-20 blur-3xl" />
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: [0.32, 0.72, 0, 1],
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-accent blur-2xl"
        />
        <div className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-accent/50" />
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-paper" />
      </div>
      <div className="relative z-50 flex -translate-y-32 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
}

export function HeroHighlight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.span
      initial={{ backgroundSize: "0% 100%" }}
      animate={{ backgroundSize: "100% 100%" }}
      transition={{ duration: 2, ease: [0.32, 0.72, 0, 1], delay: 0.5 }}
      style={{
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        display: "inline",
      }}
      className={cn(
        "relative inline-block rounded-lg bg-gradient-to-r from-accent/30 to-accent/10 px-1 pb-1",
        className
      )}
    >
      {children}
    </motion.span>
  );
}
