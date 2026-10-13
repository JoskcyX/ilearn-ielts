"use client";

import { useCallback, useState } from "react";
import { Check } from "lucide-react";
import { ExamTopBar } from "@/components/exam/ExamTopBar";
import { SectionNav } from "@/components/exam/SectionNav";
import { WritingTaskField } from "@/components/exam/WritingTaskField";
import { SpeakingRecorder } from "@/components/exam/SpeakingRecorder";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type WritingTask = { taskNumber: number; prompt: string };
type SpeakingPart = {
  part: number;
  cueCardTopic?: string;
  cueCardPoints?: string[];
  prepSeconds?: number;
  speakSeconds?: number;
};

/**
 * Shared client shell for the Writing and Speaking sections. Writing needs
 * its own pending-save tracking (mirroring the Reading/Listening workspace)
 * so a student can't click "Next section" moments after typing and have
 * the in-flight save lose the race against navigation.
 */
export function WritingSpeakingWorkspace({
  attemptId,
  mockTestTitle,
  sectionLabel,
  deadlineIso,
  isLastSection,
  writingTasks,
  speakingParts,
  writingResponses,
  speakingRecordings,
}: {
  attemptId: string;
  mockTestTitle: string;
  sectionLabel: "WRITING" | "SPEAKING";
  deadlineIso?: string;
  isLastSection: boolean;
  writingTasks: WritingTask[];
  speakingParts: SpeakingPart[];
  writingResponses: Record<string, string> | null;
  speakingRecordings: Record<number, { url: string }>;
}) {
  // Keyed by "writing-<taskNumber>" / "speaking-<part>" so the two
  // section's pending-save tracking can't collide on the same small
  // integers.
  const [pendingSaves, setPendingSaves] = useState<Record<string, boolean>>({});
  const hasPendingSaves = Object.values(pendingSaves).some(Boolean);

  const handlePendingChange = useCallback((key: string, pending: boolean) => {
    setPendingSaves((prev) => {
      if (pending) return prev[key] ? prev : { ...prev, [key]: true };
      if (!prev[key]) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  const handleWritingPendingChange = useCallback(
    (taskNumber: number, pending: boolean) => handlePendingChange(`writing-${taskNumber}`, pending),
    [handlePendingChange]
  );
  const handleSpeakingPendingChange = useCallback(
    (part: number, pending: boolean) => handlePendingChange(`speaking-${part}`, pending),
    [handlePendingChange]
  );

  return (
    <div className="flex h-full flex-col">
      <ExamTopBar
        attemptId={attemptId}
        title={mockTestTitle}
        sectionLabel={sectionLabel}
        deadlineIso={deadlineIso}
        isLastSection={isLastSection}
      />
      <div className="shrink-0 border-b border-border bg-ink-soft px-5 py-3">
        <p className="text-sm font-semibold text-foreground">
          {sectionLabel === "WRITING" ? "Writing" : "Speaking"}
        </p>
        <p className="text-sm text-muted">
          {sectionLabel === "WRITING"
            ? "Complete both tasks below. Word count updates as you type."
            : "Use the cue cards to practice out loud."}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {sectionLabel === "WRITING" ? (
          <div className="space-y-6">
            {writingTasks.map((task) => (
              <Card key={task.taskNumber} className="space-y-3 p-5">
                <Badge variant="neutral">Task {task.taskNumber}</Badge>
                <p className="text-sm text-foreground">{task.prompt}</p>
                <WritingTaskField
                  attemptId={attemptId}
                  taskNumber={task.taskNumber}
                  initialText={writingResponses?.[String(task.taskNumber)] ?? ""}
                  onPendingChange={handleWritingPendingChange}
                />
              </Card>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="rounded-md bg-ink-soft p-3 text-sm text-muted">
              Record your answer for each part below — recordings upload automatically as soon as
              you stop, and you can re-record before moving on.
            </p>
            {speakingParts.map((part) => (
              <Card key={part.part} className="space-y-3 p-5">
                <Badge variant="neutral">Part {part.part}</Badge>
                {part.cueCardTopic && (
                  <>
                    <p className="text-sm font-medium text-foreground">{part.cueCardTopic}</p>
                    {part.cueCardPoints && (
                      <ul className="list-disc space-y-1 pl-5 text-sm text-muted">
                        {part.cueCardPoints.map((point, i) => (
                          <li key={i}>{point}</li>
                        ))}
                      </ul>
                    )}
                    {(part.prepSeconds || part.speakSeconds) && (
                      <p className="text-xs text-muted">
                        {part.prepSeconds ? `${part.prepSeconds}s to prepare` : ""}
                        {part.prepSeconds && part.speakSeconds ? " · " : ""}
                        {part.speakSeconds ? `${part.speakSeconds}s to speak` : ""}
                      </p>
                    )}
                  </>
                )}
                <SpeakingRecorder
                  attemptId={attemptId}
                  part={part.part}
                  initialRecording={speakingRecordings[part.part] ?? null}
                  onPendingChange={handleSpeakingPendingChange}
                />
              </Card>
            ))}
          </div>
        )}
      </div>

      <div className="flex shrink-0 items-center justify-end border-t border-border bg-surface px-5 py-3">
        <SectionNav
          attemptId={attemptId}
          isLastSection={isLastSection}
          icon={<Check className="h-4 w-4" />}
          savesPending={hasPendingSaves}
        />
      </div>
    </div>
  );
}
