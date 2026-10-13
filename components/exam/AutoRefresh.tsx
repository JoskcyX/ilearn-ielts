"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * While `active`, re-fetches the server-rendered page every few seconds so
 * results appear on their own (used while AI scoring is running). Skips
 * background tabs and gives up after `maxMinutes`; the backend treats scoring
 * older than 10 minutes as failed and offers a retry.
 */
export function AutoRefresh({
  active,
  everyMs = 3000,
  maxMinutes = 12,
}: {
  active: boolean;
  everyMs?: number;
  maxMinutes?: number;
}) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;
    const startedAt = Date.now();
    const id = setInterval(() => {
      if (Date.now() - startedAt > maxMinutes * 60_000) {
        clearInterval(id);
        return;
      }
      if (!document.hidden) router.refresh();
    }, everyMs);
    return () => clearInterval(id);
  }, [active, everyMs, maxMinutes, router]);

  return null;
}
