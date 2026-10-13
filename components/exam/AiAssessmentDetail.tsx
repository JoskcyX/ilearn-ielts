"use client";

import { useState, useTransition } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AiAssessmentItem, SpeakingRecordingItem } from "@/lib/types/exam";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";

const CRITERION_LABELS: Record<string, string> = {
  taskResponse: "Task response",
  coherenceCohesion: "Coherence & cohesion",
  lexicalResource: "Lexical resource",
  grammaticalRange: "Grammatical range & accuracy",
  fluencyCoherence: "Fluency & coherence",
  pronunciation: "Pronunciation",
};

function CriteriaRow({ criteria }: { criteria: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-4">
      {Object.entries(criteria).map(([key, bandX10]) => (
        <div key={key}>
          <p className="text-xs text-muted">{CRITERION_LABELS[key] ?? key}</p>
          <p className="font-mono text-sm font-semibold text-foreground">{(bandX10 / 10).toFixed(1)}</p>
        </div>
      ))}
    </div>
  );
}

function RetryButton({
  attemptId,
  section,
  taskNumber,
}: {
  attemptId: string;
  section: "WRITING" | "SPEAKING";
  taskNumber: number;
}) {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-1">
      <Button
        variant="outline"
        className="text-xs"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            const result = await call(`/api/exam/attempts/${attemptId}/rerun-assessment`, { method: "POST", body: { section, taskNumber } });
            setError(result.success ? null : result.error);
            if (result.success) router.refresh();
          })
        }
      >
        {isPending ? "Retrying…" : "Retry AI assessment"}
      </Button>
      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}

function AssessmentCard({
  attemptId,
  title,
  item,
}: {
  attemptId: string;
  title: string;
  item: AiAssessmentItem;
}) {
  return (
    <Card className="space-y-3 p-5">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {item.status === "COMPLETE" && item.overallBandX10 !== null ? (
          <span className="font-mono text-lg font-semibold text-brand">
            {(item.overallBandX10 / 10).toFixed(1)}
          </span>
        ) : item.status === "FAILED" ? (
          <Badge variant="warning">Failed</Badge>
        ) : (
          <Badge variant="neutral">Pending</Badge>
        )}
      </div>

      {item.status === "COMPLETE" && item.criteriaScores && (
        <CriteriaRow criteria={item.criteriaScores} />
      )}
      {item.feedback && <p className="text-sm text-muted">{item.feedback}</p>}
      {item.status === "FAILED" && (
        <>
          {item.errorMessage && <p className="text-xs text-danger">{item.errorMessage}</p>}
          <RetryButton attemptId={attemptId} section={item.section} taskNumber={item.taskNumber} />
        </>
      )}
    </Card>
  );
}

const WRITING_TASK_TITLES: Record<number, string> = { 1: "Task 1", 2: "Task 2" };

export function AiAssessmentDetail({
  attemptId,
  assessments,
  recordings,
}: {
  attemptId: string;
  assessments: AiAssessmentItem[];
  recordings: SpeakingRecordingItem[];
}) {
  const writing = assessments.filter((a) => a.section === "WRITING");
  const speaking = assessments.find((a) => a.section === "SPEAKING");

  if (writing.length === 0 && !speaking && recordings.length === 0) return null;

  return (
    <div className="space-y-6">
      {writing.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">AI Writing assessment</h2>
          {writing.map((item) => (
            <AssessmentCard
              key={item.id}
              attemptId={attemptId}
              title={WRITING_TASK_TITLES[item.taskNumber] ?? `Task ${item.taskNumber}`}
              item={item}
            />
          ))}
        </div>
      )}

      {(speaking || recordings.length > 0) && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-foreground">Speaking</h2>

          {recordings.length > 0 && (
            <Card className="space-y-3 p-5">
              <p className="text-sm font-semibold text-foreground">Recordings</p>
              {recordings.map((r) => (
                <div key={r.id} className="space-y-1">
                  <p className="text-xs text-muted">
                    Part {r.part}
                    {r.durationSec ? ` · ${r.durationSec}s` : ""}
                  </p>
                  <audio controls src={r.url} className="w-full" />
                  {r.transcript && (
                    <p className="text-xs text-muted">
                      <span className="font-medium">Transcript:</span> {r.transcript}
                    </p>
                  )}
                </div>
              ))}
            </Card>
          )}

          {speaking && (
            <AssessmentCard attemptId={attemptId} title="Overall Speaking assessment" item={speaking} />
          )}
        </div>
      )}
    </div>
  );
}
