"use client";

import { cn } from "@/lib/utils";

export function PageBackground({ className }: { className?: string }) {
  return (
    <div className={cn("pointer-events-none fixed inset-0 -z-10 overflow-hidden", className)} aria-hidden="true">
      <div className="absolute inset-0 bg-[#07080f]" />

      <div
        className="absolute inset-0 opacity-100"
        style={{
          background: `
            radial-gradient(ellipse 90% 60% at 10% -10%, rgba(52, 87, 213, 0.22), transparent 55%),
            radial-gradient(ellipse 70% 50% at 90% 0%, rgba(16, 185, 129, 0.12), transparent 50%),
            radial-gradient(ellipse 60% 40% at 50% 100%, rgba(99, 102, 241, 0.14), transparent 55%),
            radial-gradient(ellipse 40% 30% at 80% 60%, rgba(52, 87, 213, 0.08), transparent 50%)
          `,
        }}
      />

      <div
        className="absolute inset-0 animate-aurora opacity-40"
        style={{
          backgroundImage: `
            radial-gradient(at 27% 37%, rgba(52, 87, 213, 0.25) 0px, transparent 50%),
            radial-gradient(at 97% 21%, rgba(16, 185, 129, 0.15) 0px, transparent 50%),
            radial-gradient(at 52% 99%, rgba(99, 102, 241, 0.18) 0px, transparent 50%),
            radial-gradient(at 10% 79%, rgba(52, 87, 213, 0.12) 0px, transparent 50%)
          `,
          backgroundSize: "200% 200%",
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
          maskImage: "radial-gradient(ellipse 80% 70% at 50% 30%, black 20%, transparent 75%)",
        }}
      />

      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}
