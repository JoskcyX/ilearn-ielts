import { serverFetch } from "@/lib/server-api";
import type { AudioResponse, PassagesResponse, QuestionGroupDetailResponse } from "@/lib/types/admin-content";
import { QuestionBuilder } from "@/components/admin/builder/QuestionBuilder";

export default async function QuestionGroupBuilderPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = await params;
  const [detail, { passages }, { audio }] = await Promise.all([
    serverFetch<QuestionGroupDetailResponse>(`/api/admin/question-groups/${groupId}`),
    serverFetch<PassagesResponse>("/api/admin/passages"),
    serverFetch<AudioResponse>("/api/admin/audio"),
  ]);
  return (
    <QuestionBuilder
      {...detail}
      orgPassages={passages.map((p) => ({ id: p.id, title: p.title }))}
      orgAudio={audio.map((a) => ({ id: a.id, title: a.title }))}
    />
  );
}
