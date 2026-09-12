import { cn } from "@/lib/utils";

export function Logo({
  className, showWordmark = true, size = "md",
}: {
  className?: string;
  showWordmark?: boolean;
  size?: "sm" | "md";
}) {
  const dimension = size === "sm" ? 26 : 30;
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <svg width={dimension} height={dimension} viewBox="0 0 30 30" fill="none" aria-hidden="true">
        <rect x="1" y="1" width="28" height="28" rx="6" fill="#171d25" stroke="#303842" />
        <path d="M8.5 10.5h5l3 4.5-3 4.5h-5l3-4.5-3-4.5Z" stroke="#58a6ff" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="M17 10.5h4.5M17 19.5h4.5" stroke="#aab3bd" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {showWordmark ? (
        <span className="text-sm font-semibold tracking-tight text-primary">OSS Manager</span>
      ) : null}
    </div>
  );
}
