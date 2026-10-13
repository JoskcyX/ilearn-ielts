import { serverFetch } from "@/lib/server-api";
import type { MockTestBuilderResponse } from "@/lib/types/admin-content";
import { AddSectionForm } from "@/components/admin/mock-tests/AddSectionForm";
import { ListeningReadingContentForm } from "@/components/admin/mock-tests/ListeningReadingContentForm";
import { WritingContentForm } from "@/components/admin/mock-tests/WritingContentForm";
import { SpeakingContentForm } from "@/components/admin/mock-tests/SpeakingContentForm";
import { PublishMockTestControl } from "@/components/admin/mock-tests/PublishMockTestControl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const REQUIRED_SECTIONS = ["LISTENING", "READING", "WRITING", "SPEAKING"] as const;
type SectionName = (typeof REQUIRED_SECTIONS)[number];

export default async function MockTestBuilderPage({
  params,
}: {
  params: Promise<{ mockTestId: string }>;
}) {
  const { mockTestId } = await params;

  const { mockTest, sections, candidateGroups } =
    await serverFetch<MockTestBuilderResponse>(`/api/admin/mock-tests/${mockTestId}`);

  const missingSections = REQUIRED_SECTIONS.filter(
    (s) => !sections.some((sec) => sec.section === s)
  ) as SectionName[];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">
            {mockTest.title}
          </h1>
          <div className="mt-1 flex gap-2">
            <Badge variant="neutral">
              {mockTest.testType === "ACADEMIC" ? "Academic" : "General Training"}
            </Badge>
            <Badge
              variant={
                mockTest.status === "PUBLISHED"
                  ? "success"
                  : mockTest.status === "ARCHIVED"
                    ? "warning"
                    : "neutral"
              }
            >
              {mockTest.status}
            </Badge>
          </div>
        </div>
        <PublishMockTestControl mockTestId={mockTest.id} status={mockTest.status} />
      </div>

      {mockTest.status !== "DRAFT" && (
        <p className="rounded-md bg-warning-soft p-3 text-sm text-warning">
          {mockTest.status === "PUBLISHED"
            ? "This mock test is published and visible to students. Sections can no longer be edited here."
            : "This mock test is archived."}
        </p>
      )}

      {sections.map((section) => (
        <Card key={section.id} className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-foreground">
              {section.section.charAt(0) + section.section.slice(1).toLowerCase()}
            </h2>
            <span className="font-mono text-sm text-muted">
              {Math.round(section.timeLimitSec / 60)} min
            </span>
          </div>

          {mockTest.status === "DRAFT" &&
            (section.section === "LISTENING" || section.section === "READING") && (
              <ListeningReadingContentForm
                sectionId={section.id}
                candidates={candidateGroups
                  .filter((g) => g.section === section.section)
                  .map((g) => ({
                    id: g.id,
                    label: `Part ${g.part} — ${g.title}`,
                    questionCount: g.questionCount,
                  }))}
                initialSelectedIds={section.questionGroupIds ?? []}
              />
            )}

          {mockTest.status === "DRAFT" && section.section === "WRITING" && (
            <WritingContentForm
              sectionId={section.id}
              initialTasks={section.writingTasks as never}
            />
          )}

          {mockTest.status === "DRAFT" && section.section === "SPEAKING" && (
            <SpeakingContentForm
              sectionId={section.id}
              initialParts={section.speakingParts as never}
            />
          )}

          {mockTest.status !== "DRAFT" &&
            (section.section === "LISTENING" || section.section === "READING") && (
              <p className="text-sm text-muted">
                {(section.questionGroupIds ?? []).length} question group(s) assigned.
              </p>
            )}
        </Card>
      ))}

      {mockTest.status === "DRAFT" && missingSections.length > 0 && (
        <Card className="space-y-2 p-5">
          <h2 className="text-sm font-semibold text-foreground">Add a section</h2>
          <AddSectionForm mockTestId={mockTest.id} missingSections={missingSections} />
        </Card>
      )}
    </div>
  );
}
