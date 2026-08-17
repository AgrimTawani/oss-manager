import { cn } from "@/lib/utils";

export function DashboardEmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[1.25rem] border border-dashed border-white/10 px-6 py-16 text-center",
        className
      )}
    >
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.03]">
        <span className="font-mono text-lg text-ink/30">—</span>
      </div>
      <p className="text-sm font-medium text-ink/70">{title}</p>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink/40">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
