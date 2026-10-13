import { cn } from "@/lib/utils";

/** Original ILEARN Spaces mark: a doorway (an arch you step into) with a small sun above it. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden="true">
      <rect width="32" height="32" rx="10" fill="#0e8479" />
      <path d="M8 25V16a8 8 0 0 1 16 0v9h-5.5v-8.5a2.5 2.5 0 0 0-5 0V25H8Z" fill="#fff" />
      <circle cx="24.5" cy="7.5" r="2.6" fill="#d4e84a" />
    </svg>
  );
}

export function Logo({ className, showWord = true }: { className?: string; showWord?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <LogoMark />
      {showWord && (
        <span className="font-display text-[17px] font-bold tracking-tight text-foreground">
          ILEARN <span className="text-brand">Spaces</span>
        </span>
      )}
    </span>
  );
}
