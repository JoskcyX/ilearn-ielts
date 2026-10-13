import type { ComponentProps } from "react";
import { serverFetch } from "@/lib/server-api";
import type { AdminResultDetail } from "@/lib/types/admin";
import { requireRole } from "@/lib/auth-guard";
import { ResultSummary } from "@/components/exam/ResultSummary";
import { QuestionReview } from "@/components/exam/QuestionReview";
import { AiAssessmentDetail } from "@/components/exam/AiAssessmentDetail";
import { AutoRefresh } from "@/components/exam/AutoRefresh";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type AiProps = ComponentProps<typeof AiAssessmentDetail>;

export default async function AdminResultDetailPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  await requireRole("ADMIN");
  const {
    mockTestTitle,
    student,
    attempt,
    writingTasks,
    reviewItems,
    aiAssessments,
    speakingRecordings,
  } = await serverFetch<AdminResultDetail>(`/api/admin/results/${attemptId}`);

  if (attempt.status !== "SUBMITTED") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted">{student?.name}</p>
        <h1 className="text-2xl font-semibold text-foreground">{mockTestTitle}</h1>
        <Badge variant="neutral">Still in progress</Badge>
        <p className="text-sm text-muted">
          This student hasn&apos;t submitted this attempt yet — check back once they do.
        </p>
      </div>
    );
  }

  const scoring = Object.values(attempt.scores ?? {}).some(
    (s) => (s as { status?: string } | null)?.status === "processing"
  );

  return (
    <div className="space-y-6">
      <AutoRefresh active={scoring} />
      <div>
        <p className="text-sm text-muted">
          {student?.name} · {student?.email}
        </p>
      </div>

      <ResultSummary attempt={attempt as unknown as ComponentProps<typeof ResultSummary>["attempt"]} mockTestTitle={mockTestTitle} />

      <QuestionReview items={reviewItems} />

      <AiAssessmentDetail attemptId={attemptId} assessments={aiAssessments as AiProps["assessments"]} recordings={speakingRecordings as AiProps["recordings"]} />

      {writingTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">Writing responses</h2>
          {writingTasks.map((task) => (
            <Card key={task.taskNumber} className="space-y-2 p-5">
              <Badge variant="neutral">Task {task.taskNumber}</Badge>
              <p className="text-sm text-muted">{task.prompt}</p>
              <div className="whitespace-pre-wrap rounded-md bg-ink-soft p-3 text-sm text-foreground">
                {attempt.writingResponses?.[String(task.taskNumber)] || (
                  <span className="text-muted">No response submitted.</span>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
