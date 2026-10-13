"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function StartAttemptButton({ mockTestId }: { mockTestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1.5">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await call<{ attemptId: string }>("/api/exam/attempts", { method: "POST", body: { mockTestId } });
            if (result.success) {
              router.push(`/exam/${result.attemptId}`);
            } else {
              setError(result.error);
            }
          })
        }
      >
        {isPending ? "Starting…" : "Start"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
