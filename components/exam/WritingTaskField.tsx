"use client";

import { useState, useTransition } from "react";
import { call } from "@/lib/api";
import { Textarea } from "@/components/ui/textarea";

function wordCount(text: string) {
  const trimmed = text.trim();
  return trimmed ? trimmed.split(/\s+/).length : 0;
}

export function WritingTaskField({
  attemptId,
  taskNumber,
  initialText,
  onPendingChange,
}: {
  attemptId: string;
  taskNumber: number;
  initialText: string;
  /** Reported true while this task's save is in flight, so the page can
   *  hold Next/Submit until it settles — see AnswerField's useAutosave
   *  for why this guard exists. */
  onPendingChange?: (taskNumber: number, pending: boolean) => void;
}) {
  const [text, setText] = useState(initialText);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [, startTransition] = useTransition();

  function commit(value: string) {
    setSaveState("saving");
    onPendingChange?.(taskNumber, true);
    startTransition(async () => {
      const result = await call(`/api/exam/attempts/${attemptId}/writing`, { method: "PUT", body: { taskNumber, text: value } });
      setSaveState(result.success ? "saved" : "error");
      onPendingChange?.(taskNumber, false);
    });
  }

  return (
    <div className="space-y-1.5">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onBlur={(e) => commit(e.currentTarget.value)}
        className="min-h-56"
        placeholder="Write your response here…"
      />
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted">{wordCount(text)} words</span>
        {saveState !== "idle" && (
          <span
            className={
              saveState === "saving"
                ? "text-muted"
                : saveState === "saved"
                  ? "text-success"
                  : "text-danger"
            }
          >
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : "Couldn't save"}
          </span>
        )}
      </div>
    </div>
  );
}
