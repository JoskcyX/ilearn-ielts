import { requireRole } from "@/lib/auth-guard";
import { serverFetch } from "@/lib/server-api";
import type { ExamPageData } from "@/lib/types/exam";
import { ReadingListeningWorkspace } from "@/components/exam/ReadingListeningWorkspace";
import { WritingSpeakingWorkspace } from "@/components/exam/WritingSpeakingWorkspace";
import { ResultSummary } from "@/components/exam/ResultSummary";
import { QuestionReview } from "@/components/exam/QuestionReview";
import { AiAssessmentDetail } from "@/components/exam/AiAssessmentDetail";
import { AutoRefresh } from "@/components/exam/AutoRefresh";

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ attemptId: string }>;
}) {
  const { attemptId } = await params;
  await requireRole("STUDENT");

  const data = await serverFetch<ExamPageData>(`/api/exam/attempts/${encodeURIComponent(attemptId)}`);

  if (data.view === "RESULTS") {
    // Keep the page fresh while AI scoring is running in the background.
    const scoring = Object.values(data.attempt.scores ?? {}).some(
      (s) => (s as { status?: string } | null)?.status === "processing"
    );
    return (
      <div className="h-full overflow-y-auto p-6 md:p-10">
        <AutoRefresh active={scoring} />
        <div className="mx-auto max-w-4xl space-y-10">
          <ResultSummary attempt={data.attempt} mockTestTitle={data.mockTestTitle} />
          <QuestionReview items={data.reviewItems} />
          <AiAssessmentDetail
            attemptId={attemptId}
            assessments={data.aiAssessments}
            recordings={data.speakingRecordings}
          />
        </div>
      </div>
    );
  }

  if (data.view === "READING_LISTENING") {
    return (
      <ReadingListeningWorkspace
        attemptId={attemptId}
        mockTestTitle={data.mockTestTitle}
        sectionLabel={data.sectionLabel}
        deadlineIso={data.deadlineIso ?? undefined}
        isLastSection={data.isLastSection}
        groups={data.groups}
        initialResponses={data.initialResponses}
      />
    );
  }

  return (
    <WritingSpeakingWorkspace
      attemptId={attemptId}
      mockTestTitle={data.mockTestTitle}
      sectionLabel={data.sectionLabel}
      deadlineIso={data.deadlineIso ?? undefined}
      isLastSection={data.isLastSection}
      writingTasks={data.writingTasks}
      speakingParts={data.speakingParts}
      writingResponses={data.writingResponses}
      speakingRecordings={data.speakingRecordings}
    />
  );
}
