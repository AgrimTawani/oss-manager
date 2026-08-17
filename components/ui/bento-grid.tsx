import React from "react";
import { cn } from "@/lib/utils";

export function BentoGrid({
  className,
  children,
}: {
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "mx-auto grid max-w-7xl grid-flow-dense auto-rows-[minmax(180px,auto)] grid-cols-1 gap-4 md:grid-cols-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export function BentoGridItem({
  className,
  title,
  description,
  header,
  icon,
}: {
  className?: string;
  title?: string | React.ReactNode;
  description?: string | React.ReactNode;
  header?: React.ReactNode;
  icon?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "group/bento relative row-span-1 flex flex-col justify-between overflow-hidden rounded-[1.25rem] border border-line bg-surface-raised p-4 transition duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-white/15",
        className
      )}
    >
      {header}
      <div className="transition duration-700 group-hover/bento:translate-x-1">
        {icon}
        <div className="mt-2 mb-2 font-sans text-lg font-medium text-ink">{title}</div>
        <div className="font-sans text-sm text-ink/55">{description}</div>
      </div>
    </div>
  );
}
