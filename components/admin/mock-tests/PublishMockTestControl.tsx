"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { api, ApiError, call } from "@/lib/api";
import { Button } from "@/components/ui/button";

export function PublishMockTestControl({
  mockTestId,
  status,
}: {
  mockTestId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
}) {
  const router = useRouter();
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();

  function handlePublish() {
    setErrors([]);
    startTransition(async () => {
      try {
        await api(`/api/admin/mock-tests/${mockTestId}/publish`, { method: "POST", body: {} });
      } catch (err) {
        if (err instanceof ApiError) {
          setErrors(Array.isArray(err.issues) ? (err.issues as string[]) : [err.message]);
        } else {
          setErrors(["Network error. Please try again."]);
        }
        return;
      }
      router.refresh();
    });
  }

  function handleArchive() {
    startTransition(async () => {
      await call(`/api/admin/mock-tests/${mockTestId}/archive`, { method: "POST", body: {} });
      router.refresh();
    });
  }

  if (status === "ARCHIVED") {
    return <p className="text-sm text-muted">This mock test is archived.</p>;
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        {status === "DRAFT" && (
          <Button onClick={handlePublish} disabled={isPending}>
            {isPending ? "Publishing…" : "Publish"}
          </Button>
        )}
        <Button variant="outline" onClick={handleArchive} disabled={isPending}>
          Archive
        </Button>
      </div>
      {errors.length > 0 && (
        <div className="rounded-md bg-danger-soft p-3 text-sm text-danger">
          <p className="font-medium">Can&apos;t publish yet:</p>
          <ul className="mt-1 list-inside list-disc">
            {errors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
