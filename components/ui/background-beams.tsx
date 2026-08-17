"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function BackgroundBeams({ className }: { className?: string }) {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
    "M-359 -213C-359 -213 -291 192 173 319C637 446 705 851 705 851",
    "M-352 -221C-352 -221 -284 184 180 311C644 438 712 843 712 843",
  ];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 flex h-full w-full items-center justify-center overflow-hidden",
        className
      )}
      aria-hidden="true"
    >
      <svg
        className="absolute h-full w-full opacity-30"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={path}
            d={path}
            stroke={`url(#gradient-${index})`}
            strokeOpacity="0.4"
            strokeWidth="0.5"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{
              duration: 2,
              delay: index * 0.3,
              ease: [0.32, 0.72, 0, 1],
            }}
          />
        ))}
        <defs>
          {paths.map((_, index) => (
            <linearGradient
              key={`gradient-${index}`}
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop stopColor="#3457d5" stopOpacity="0" />
              <stop offset="50%" stopColor="#3457d5" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#3457d5" stopOpacity="0" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}
