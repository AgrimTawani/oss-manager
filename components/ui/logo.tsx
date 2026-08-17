import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
  size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md";
}) {
  const iconSize = size === "sm" ? 28 : 34;

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 34 34"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="1"
          y="1"
          width="32"
          height="32"
          rx="10"
          fill="rgba(255,255,255,0.06)"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="1"
        />
        <path
          d="M10 17c0-3.866 3.134-7 7-7s7 3.134 7 7-3.134 7-7 7"
          stroke="#3457d5"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M17 10v14M10 17h14"
          stroke="rgba(250,250,250,0.7)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <circle cx="23" cy="11" r="3" fill="rgba(52,211,153,0.9)" />
      </svg>
      {showWordmark && (
        <div className="leading-tight">
          <span
            className={cn(
              "block font-semibold tracking-[-0.02em] text-ink",
              size === "sm" ? "text-sm" : "text-base"
            )}
          >
            OSS Manager
          </span>
          {size === "md" && (
            <span className="hidden font-mono text-[10px] uppercase tracking-[0.14em] text-ink/40 sm:block">
              Maintainer signals only
            </span>
          )}
        </div>
      )}
    </div>
  );
}
