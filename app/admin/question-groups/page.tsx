import { Suspense } from "react";
import Link from "next/link";
import { HelpCircle } from "lucide-react";
import { serverFetch } from "@/lib/server-api";
import type { QuestionGroupsResponse } from "@/lib/types/admin-content";
import { PageHeader } from "@/components/dashboard/blocks";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { Badge } from "@/components/ui/badge";
import { GroupFilters } from "@/components/admin/builder/GroupFilters";
import { NewGroupButton } from "@/components/admin/builder/NewGroupButton";

const SECTION_LABEL = { READING: "Reading", LISTENING: "Listening", WRITING: "Writing", SPEAKING: "Speaking" } as const;
const STATUS_VARIANT = { PUBLISHED: "success", ARCHIVED: "warning", DRAFT: "neutral" } as const;
const STATUS_LABEL = { PUBLISHED: "Published", ARCHIVED: "Archived", DRAFT: "Draft" } as const;

export default async function AdminQuestionGroupsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const qs = new URLSearchParams();
  for (const k of ["section", "testType", "status", "q"]) {
    const v = sp[k];
    if (typeof v === "string" && v) qs.set(k, v);
  }
  const filtered = qs.size > 0;
  const { groups, passages, audioAssets } = await serverFetch<QuestionGroupsResponse>(
    `/api/admin/question-groups${filtered ? `?${qs}` : ""}`
  );

  return (
    <div>
      <PageHeader
        title="Question groups"
        subtitle="A group is a passage or audio clip, optional shared content, and its questions. Mock tests are built from groups."
        action={<NewGroupButton passages={passages} audioAssets={audioAssets} />}
      />
      <div className="mb-6">
        <Suspense fallback={null}>
          <GroupFilters />
        </Suspense>
      </div>

      {groups.length === 0 ? (
        <EmptyState
          title={filtered ? "No groups match these filters" : "No question groups yet"}
          description={filtered ? "Try a different search or clear the filters." : "Create a group, then add content and questions in the builder."}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {groups.map((g) => (
            <li key={g.id}>
              <Link
                href={`/admin/question-groups/${g.id}`}
                className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-surface p-4 transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="line-clamp-2 font-display text-base font-bold leading-snug">
                    {g.title || `${SECTION_LABEL[g.section]} part ${g.part}`}
                  </h2>
                  <Badge variant={STATUS_VARIANT[g.status]}>{STATUS_LABEL[g.status]}</Badge>
                </div>
                <p className="line-clamp-2 text-sm text-muted">{g.instructions}</p>
                <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1.5 pt-1 text-xs text-muted">
                  <Badge>{SECTION_LABEL[g.section]}</Badge>
                  <span>{g.testType === "ACADEMIC" ? "Academic" : "General Training"}</span>
                  <span>Part {g.part}</span>
                  <span className="ml-auto inline-flex items-center gap-1 font-semibold text-foreground">
                    <HelpCircle className="h-3.5 w-3.5" aria-hidden />
                    {g.questionCount} {g.questionCount === 1 ? "question" : "questions"}
                  </span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
