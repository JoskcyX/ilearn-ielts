import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RunAssessmentButton } from "./RunAssessmentButton";

type ObjectiveScore = { raw: number; maxRaw: number; band: number | null };
type PendingScore = { status: "pending_review"; wordCounts?: Record<string, number> };
type UnavailableScore = { status: "not_available" };
type AiAssessedScore = { status: "ai_assessed"; aiBandX10: number };
type AiFailedScore = { status: "ai_failed" };
type ProcessingScore = { status: "processing" };
type SectionScore =
  | ObjectiveScore
  | PendingScore
  | UnavailableScore
  | AiAssessedScore
  | AiFailedScore
  | ProcessingScore;

const SECTION_LABELS: Record<string, string> = {
  LISTENING: "Listening",
  READING: "Reading",
  WRITING: "Writing",
  SPEAKING: "Speaking",
};

function isObjectiveScore(s: SectionScore): s is ObjectiveScore {
  return "raw" in s;
}

function SectionScoreCard({ attemptId, section, score }: { attemptId: string; section: string; score: SectionScore }) {
  const aiSection = section === "WRITING" || section === "SPEAKING" ? section : null;
  return (
    <Card className="space-y-2 p-5">
      <p className="text-sm font-semibold text-foreground">{SECTION_LABELS[section] ?? section}</p>
      {isObjectiveScore(score) ? (
        <>
          <p className="font-mono text-2xl font-semibold text-foreground">
            {score.band !== null ? score.band.toFixed(1) : "—"}
          </p>
          <p className="text-xs text-muted">
            {score.raw} / {score.maxRaw} correct
            {score.band === null && " · no band conversion configured for this organization yet"}
          </p>
        </>
      ) : score.status === "ai_assessed" ? (
        <>
          <p className="font-mono text-2xl font-semibold text-foreground">
            {(score.aiBandX10 / 10).toFixed(1)}
          </p>
          <p className="text-xs text-muted">AI-assessed estimate — see the breakdown below.</p>
        </>
      ) : score.status === "processing" ? (
        <>
          <Badge variant="neutral">Scoring in progress…</Badge>
          <p className="text-xs text-muted">
            The AI is marking this section. This usually takes under a minute, and this page updates by itself.
          </p>
        </>
      ) : score.status === "ai_failed" ? (
        <>
          <Badge variant="warning">AI assessment failed</Badge>
          <p className="text-xs text-muted">
            Your response was saved, but the AI assessment didn&apos;t finish. You can try again.
          </p>
          {aiSection && <RunAssessmentButton attemptId={attemptId} section={aiSection} label="Retry AI assessment" />}
        </>
      ) : score.status === "pending_review" ? (
        <>
          <Badge variant="warning">Not scored yet</Badge>
          <p className="text-xs text-muted">
            Your response was saved, but no one has marked this section yet. You can have it scored by AI now.
          </p>
          {aiSection && <RunAssessmentButton attemptId={attemptId} section={aiSection} />}
        </>
      ) : (
        <>
          <Badge variant="neutral">Not available</Badge>
          <p className="text-xs text-muted">No Speaking recording was captured for this attempt.</p>
        </>
      )}
    </Card>
  );
}

export function ResultSummary({
  attempt,
  mockTestTitle,
}: {
  attempt: {
    id: string;
    scores: Record<string, unknown> | null;
    overallBandX10: number | null;
    submittedAt: Date | string | null;
  };
  mockTestTitle: string;
}) {
  const scores = (attempt.scores ?? {}) as Record<string, SectionScore>;
  const sectionOrder = ["LISTENING", "READING", "WRITING", "SPEAKING"].filter((s) => s in scores);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm text-muted">Result</p>
        <h1 className="text-2xl font-semibold text-foreground">{mockTestTitle}</h1>
        {attempt.submittedAt && (
          <p className="mt-1 text-sm text-muted">
            Submitted {new Date(attempt.submittedAt).toLocaleString()}
          </p>
        )}
      </div>

      <Card className="space-y-1 p-5">
        <p className="text-sm font-semibold text-foreground">Estimated overall band</p>
        <p className="font-mono text-4xl font-semibold text-brand">
          {attempt.overallBandX10 !== null ? (attempt.overallBandX10 / 10).toFixed(1) : "—"}
        </p>
        <p className="text-xs text-muted">
          {attempt.overallBandX10 !== null
            ? "Estimated practice band — not an official IELTS result."
            : "Not all sections are scored yet, so no overall band is shown."}
        </p>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {sectionOrder.map((section) => (
          <SectionScoreCard key={section} attemptId={attempt.id} section={section} score={scores[section]} />
        ))}
      </div>

      <div className="flex gap-3">
        <Button asChild>
          <Link href="/student/tests">Back to available tests</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/student/history">View test history</Link>
        </Button>
      </div>
    </div>
  );
}
