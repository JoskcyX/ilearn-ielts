"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";

/**
 * Displays a countdown to the current section's deadline. The deadline
 * itself is server-authoritative (computed once at attempt start and
 * stored on the attempt row) — this component only ever reads it back
 * and ticks locally; it never extends or resets the clock. When time
 * runs out it calls the server to advance the section, which re-checks
 * everything from the database rather than trusting the client's clock.
 */
export function AttemptTimer({
  attemptId,
  deadlineIso,
  isLastSection,
  onExpire,
}: {
  attemptId: string;
  deadlineIso: string;
  isLastSection: boolean;
  onExpire?: () => void;
}) {
  const router = useRouter();
  const [secondsLeft, setSecondsLeft] = useState(() =>
    Math.max(0, Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000))
  );
  const [, startTransition] = useTransition();
  const [expired, setExpired] = useState(false);

  useEffect(() => {
    const id = setInterval(() => {
      const remaining = Math.max(
        0,
        Math.floor((new Date(deadlineIso).getTime() - Date.now()) / 1000)
      );
      setSecondsLeft(remaining);
      if (remaining === 0) {
        clearInterval(id);
        setExpired(true);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [deadlineIso]);

  useEffect(() => {
    if (!expired) return;
    if (!isLastSection) {
      startTransition(async () => {
        await call(`/api/exam/attempts/${attemptId}/advance`, { method: "POST" });
        router.refresh();
        onExpire?.();
      });
    } else {
      onExpire?.();
    }
  }, [expired, attemptId, isLastSection, onExpire, startTransition, router]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;
  const isLow = secondsLeft < 5 * 60;

  return (
    <div
      className={`rounded-md px-3 py-1.5 font-mono text-sm font-semibold tabular-nums ${
        isLow ? "bg-danger-soft text-danger" : "bg-ink-soft text-foreground"
      }`}
      aria-live="polite"
    >
      {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
    </div>
  );
}
