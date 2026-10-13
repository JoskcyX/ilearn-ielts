"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

type Task = { taskNumber: 1 | 2; prompt: string; imageDescription?: string };

export function WritingContentForm({
  sectionId,
  initialTasks,
}: {
  sectionId: string;
  initialTasks: Task[] | null;
}) {
  const router = useRouter();
  const [task1, setTask1] = useState(
    initialTasks?.find((t) => t.taskNumber === 1)?.prompt ?? ""
  );
  const [task2, setTask2] = useState(
    initialTasks?.find((t) => t.taskNumber === 2)?.prompt ?? ""
  );
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await call(`/api/admin/mock-tests/sections/${sectionId}/writing`, {
        method: "PUT",
        body: {
          tasks: [
            { taskNumber: 1, prompt: task1 },
            { taskNumber: 2, prompt: task2 },
          ],
        },
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="task1">Task 1 prompt</Label>
        <textarea
          id="task1"
          value={task1}
          onChange={(e) => setTask1(e.target.value)}
          rows={3}
          required
          className="w-full rounded-md border border-border bg-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
        <p className="text-xs text-muted">
          Chart/diagram image attachments arrive with the Phase 5 Writing
          engine; for now, describe the visual in the prompt text if needed.
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="task2">Task 2 prompt</Label>
        <textarea
          id="task2"
          value={task2}
          onChange={(e) => setTask2(e.target.value)}
          rows={3}
          required
          className="w-full rounded-md border border-border bg-surface p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        />
      </div>
      <div className="flex items-center gap-3">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? "Saving…" : "Save writing tasks"}
        </Button>
        {error && <span className="text-sm text-danger">{error}</span>}
        {success && <span className="text-sm text-success">Saved.</span>}
      </div>
    </form>
  );
}
