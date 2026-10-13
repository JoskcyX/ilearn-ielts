"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type GroupOption = { id: string; label: string; questionCount: number };

export function ListeningReadingContentForm({
  sectionId,
  candidates,
  initialSelectedIds,
}: {
  sectionId: string;
  candidates: GroupOption[];
  initialSelectedIds: string[];
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Record<string, number | null>>(() => {
    const map: Record<string, number | null> = {};
    candidates.forEach((c) => {
      const idx = initialSelectedIds.indexOf(c.id);
      map[c.id] = idx === -1 ? null : idx;
    });
    return map;
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function toggle(id: string, checked: boolean) {
    setSelection((prev) => ({
      ...prev,
      [id]: checked ? Object.values(prev).filter((v) => v !== null).length : null,
    }));
  }

  function setOrder(id: string, order: number) {
    setSelection((prev) => ({ ...prev, [id]: order }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    const ordered = Object.entries(selection)
      .filter(([, order]) => order !== null)
      .sort((a, b) => (a[1] as number) - (b[1] as number))
      .map(([id]) => id);

    startTransition(async () => {
      const result = await call(
        `/api/admin/mock-tests/sections/${sectionId}/listening-reading`,
        { method: "PUT", body: { questionGroupIds: ordered } }
      );
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  if (candidates.length === 0) {
    return (
      <p className="text-sm text-muted">
        No matching question groups exist yet for this test type. Create
        some on the Question groups page first.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        {candidates.map((c) => (
          <div key={c.id} className="flex items-center gap-3 text-sm">
            <input
              type="checkbox"
              checked={selection[c.id] !== null}
              onChange={(e) => toggle(c.id, e.target.checked)}
            />
            <span className="flex-1">
              {c.label} ({c.questionCount} question{c.questionCount === 1 ? "" : "s"})
            </span>
            {selection[c.id] !== null && (
              <Input
                type="number"
                min={0}
                value={selection[c.id] as number}
                onChange={(e) => setOrder(c.id, Number(e.target.value))}
                className="h-8 w-16"
              />
            )}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save section content"}
        </Button>
        {error && <span className="text-sm text-danger">{error}</span>}
        {success && <span className="text-sm text-success">Saved.</span>}
      </div>
    </form>
  );
}
