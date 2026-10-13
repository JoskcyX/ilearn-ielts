"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const DEFAULT_TIME_LIMIT: Record<string, number> = {
  LISTENING: 30 * 60,
  READING: 60 * 60,
  WRITING: 60 * 60,
  SPEAKING: 15 * 60,
};

export function AddSectionForm({
  mockTestId,
  missingSections,
}: {
  mockTestId: string;
  missingSections: ("LISTENING" | "READING" | "WRITING" | "SPEAKING")[];
}) {
  const router = useRouter();
  const [section, setSection] = useState(missingSections[0]);
  const [timeLimitMin, setTimeLimitMin] = useState(
    Math.round((DEFAULT_TIME_LIMIT[missingSections[0]] ?? 3600) / 60)
  );
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (missingSections.length === 0) return null;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await call(`/api/admin/mock-tests/${mockTestId}/sections`, {
        body: { section, timeLimitSec: timeLimitMin * 60 },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap items-end gap-3">
      <div className="space-y-1.5">
        <Label htmlFor="sectionType">Add section</Label>
        <select
          id="sectionType"
          value={section}
          onChange={(e) => {
            const s = e.target.value as typeof section;
            setSection(s);
            setTimeLimitMin(Math.round((DEFAULT_TIME_LIMIT[s] ?? 3600) / 60));
          }}
          className="flex h-10 rounded-md border border-border bg-surface px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          {missingSections.map((s) => (
            <option key={s} value={s}>
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="timeLimit">Time limit (minutes)</Label>
        <Input
          id="timeLimit"
          type="number"
          min={1}
          max={240}
          value={timeLimitMin}
          onChange={(e) => setTimeLimitMin(Number(e.target.value))}
          className="w-28"
        />
      </div>
      <Button type="submit" disabled={isPending}>
        {isPending ? "Adding…" : "Add"}
      </Button>
      {error && <span className="text-sm text-danger">{error}</span>}
    </form>
  );
}
