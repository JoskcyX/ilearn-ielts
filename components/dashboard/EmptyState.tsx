import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Used anywhere we would otherwise be tempted to show placeholder/fake
 * data. If there's nothing real to show yet, say so plainly.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border bg-surface/60 px-6 py-12 text-center",
        className
      )}
    >
      <span aria-hidden className="mb-1 h-10 w-10 rounded-t-full bg-brand-soft ring-4 ring-chartreuse/40" />
      <p className="font-display text-base font-bold text-foreground">{title}</p>
      {description && (
        <p className="max-w-sm text-sm text-muted">{description}</p>
      )}
      {action && <div className="mt-3">{action}</div>}
    </div>
  );
}
