"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Badge } from "@/components/ui/badge";

type Status = "DRAFT" | "PUBLISHED" | "ARCHIVED";

const VARIANT: Record<Status, "neutral" | "success" | "warning"> = {
  DRAFT: "neutral",
  PUBLISHED: "success",
  ARCHIVED: "warning",
};

const NEXT_ACTIONS: Record<Status, { label: string; target: Status }[]> = {
  DRAFT: [{ label: "Publish", target: "PUBLISHED" }, { label: "Archive", target: "ARCHIVED" }],
  PUBLISHED: [{ label: "Unpublish", target: "DRAFT" }, { label: "Archive", target: "ARCHIVED" }],
  ARCHIVED: [{ label: "Restore to draft", target: "DRAFT" }],
};

export function ContentStatusControl({
  id,
  status,
  endpoint,
}: {
  id: string;
  status: Status;
  /** Base API path, e.g. "/api/admin/passages"; PATCHes `${endpoint}/${id}/status`. */
  endpoint: string;
}) {
  const router = useRouter();
  const [current, setCurrent] = useState(status);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleClick(target: Status) {
    setError(null);
    startTransition(async () => {
      const result = await call(`${endpoint}/${id}/status`, {
        method: "PATCH",
        body: { status: target },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setCurrent(target);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Badge variant={VARIANT[current]}>{current}</Badge>
      {NEXT_ACTIONS[current].map((action) => (
        <button
          key={action.target}
          type="button"
          disabled={isPending}
          onClick={() => handleClick(action.target)}
          className="text-xs font-medium text-brand hover:underline disabled:opacity-50"
        >
          {action.label}
        </button>
      ))}
      {error && <span className="text-xs text-danger">{error}</span>}
    </div>
  );
}
