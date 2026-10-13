"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { call } from "@/lib/api";

/**
 * Starts (or retries) AI scoring for one section of a submitted attempt.
 * The server answers at once and scores in the background; refreshing the page
 * then shows the "scoring" state, which the page keeps up to date by itself.
 */
export function RunAssessmentButton({
  attemptId,
  section,
  label = "Run AI assessment",
}: {
  attemptId: string;
  section: "WRITING" | "SPEAKING";
  label?: string;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        className="text-xs"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await call(`/api/exam/attempts/${attemptId}/rerun-assessment`, {
              method: "POST",
              body: { section },
            });
            setError(result.success ? null : result.error);
            if (result.success) router.refresh();
          })
        }
      >
        {isPending ? "Starting…" : label}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
