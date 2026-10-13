"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function SectionNav({
  attemptId,
  isLastSection,
  icon,
  savesPending,
}: {
  attemptId: string;
  isLastSection: boolean;
  icon?: React.ReactNode;
  /** True while an answer's autosave is still in flight. Blocks Next/Submit
   *  so a click moments after answering can never race ahead of the save
   *  and silently drop the response. */
  savesPending?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isLastSection) {
    return (
      <div className="flex items-center gap-2">
        {savesPending && <span className="text-xs text-muted">Saving your answers…</span>}
        <Button
          className="rounded-full"
          disabled={isPending || savesPending}
          onClick={() =>
            startTransition(async () => {
              await call(`/api/exam/attempts/${attemptId}/advance`, { method: "POST" });
              router.refresh();
            })
          }
        >
          {icon}
          Next section
        </Button>
      </div>
    );
  }

  if (!confirming) {
    return (
      <div className="flex items-center gap-2">
        {savesPending && <span className="text-xs text-muted">Saving your answers…</span>}
        <Button
          variant="destructive"
          className="rounded-full"
          disabled={savesPending}
          onClick={() => setConfirming(true)}
        >
          {icon}
          Submit mock exam
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      {error && <p className="text-sm text-danger">{error}</p>}
      <Button variant="outline" disabled={isPending} onClick={() => setConfirming(false)}>
        Cancel
      </Button>
      <Button
        variant="destructive"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await call(`/api/exam/attempts/${attemptId}/submit`, { method: "POST" });
            if (result.success) {
              router.push(`/exam/${attemptId}`);
              router.refresh();
            } else {
              setError(result.error);
            }
          })
        }
      >
        {isPending ? "Submitting…" : "Yes, submit now"}
      </Button>
    </div>
  );
}
