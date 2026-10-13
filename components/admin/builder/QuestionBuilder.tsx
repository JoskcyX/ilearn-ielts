"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { call } from "@/lib/api";
import type { QuestionGroupDetailResponse } from "@/lib/types/admin-content";
import type { Block } from "@/lib/validations/blocks";
import { stripBlocks } from "@/lib/question-builder";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { BlocksEditor, type ImageMap } from "./BlocksEditor";
import { GroupSettings } from "./GroupSettings";
import { LivePreview } from "./LivePreview";
import { QuestionList } from "./QuestionList";
import { QuestionForm, type QuestionPayload } from "./QuestionForm";
import { BulkAdd } from "./BulkAdd";

type Props = QuestionGroupDetailResponse & {
  orgPassages: { id: string; title: string }[];
  orgAudio: { id: string; title: string }[];
};

function Panel({ id, title, hint, children }: { id: string; title: string; hint?: string; children: React.ReactNode }) {
  return (
    <Card className="p-4 sm:p-5" >
      <section aria-labelledby={id}>
        <h2 id={id} className="border-l-4 border-brand pl-3 font-display text-lg font-bold">{title}</h2>
        {hint && <p className="mb-4 mt-1 pl-4 text-sm text-muted">{hint}</p>}
        <div className={hint ? "" : "mt-4"}>{children}</div>
      </section>
    </Card>
  );
}

export function QuestionBuilder({ group, images: serverImages, questions, readiness, orgPassages, orgAudio }: Props) {
  const router = useRouter();
  const serverKey = JSON.stringify(group.blocks);
  const [savedKey, setSavedKey] = useState(serverKey);
  const [blocks, setBlocks] = useState<Block[]>(group.blocks);
  const [extraImages, setExtraImages] = useState<ImageMap>({});
  const [saving, setSaving] = useState(false);
  const [blocksError, setBlocksError] = useState<string | null>(null);
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [addKey, setAddKey] = useState(0);
  const [previewOpen, setPreviewOpen] = useState(false);

  // Server content changed (after a save or refresh) and nothing is being edited: take it.
  const dirty = JSON.stringify(stripBlocks(blocks)) !== savedKey;
  if (serverKey !== savedKey && !dirty) {
    setSavedKey(serverKey);
    setBlocks(group.blocks);
  }
  const images: ImageMap = { ...serverImages, ...extraImages };

  async function saveBlocks() {
    setBlocksError(null);
    const cleaned: Block[] = [];
    for (const b of stripBlocks(blocks)) {
      if (b.type === "options") {
        const options = b.options.map((o) => o.trim()).filter(Boolean);
        if (options.length < 2) return setBlocksError("An options list needs at least two options.");
        cleaned.push({ ...b, options });
      } else if (b.type === "text" && !b.text.trim()) continue;
      else cleaned.push(b);
    }
    setSaving(true);
    const r = await call(`/api/admin/question-groups/${group.id}`, { method: "PUT", body: { blocks: cleaned } });
    setSaving(false);
    if (!r.success) return setBlocksError(r.error);
    setBlocks(cleaned);
    setSavedKey(JSON.stringify(cleaned));
    router.refresh();
  }

  async function addQuestion(p: QuestionPayload): Promise<string | null> {
    const r = await call("/api/admin/questions", {
      body: {
        questionGroupId: group.id,
        orderIndex: questions.length,
        questionType: p.questionType,
        questionText: p.questionText,
        marks: p.marks,
        difficulty: p.difficulty ?? undefined,
        skill: p.skill ?? undefined,
        explanation: p.explanation ?? undefined,
        correctAnswer: p.correctAnswer,
      },
    });
    if (!r.success) return r.error;
    setAddKey((k) => k + 1); // reset the form
    router.refresh();
    return null;
  }

  const title = group.title || (group.section[0] + group.section.slice(1).toLowerCase() + ` part ${group.part}`);

  return (
    <div>
      <div className="mb-5">
        <Link href="/admin/question-groups" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
          <ArrowLeft className="h-4 w-4" aria-hidden /> All question groups
        </Link>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="font-display text-2xl font-extrabold md:text-3xl">{title}</h1>
          <Badge variant="neutral">{group.testType === "ACADEMIC" ? "Academic" : "General Training"}</Badge>
        </div>
      </div>

      {/* Mobile switch between editing and previewing */}
      <div role="tablist" aria-label="Builder view" className="mb-4 inline-flex rounded-xl bg-ink-soft p-1 lg:hidden">
        {[false, true].map((p) => (
          <button
            key={String(p)}
            role="tab"
            aria-selected={previewOpen === p}
            onClick={() => setPreviewOpen(p)}
            className={cn("rounded-lg px-4 py-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", previewOpen === p ? "bg-surface shadow-sm" : "text-muted")}
          >
            {p ? "Student preview" : "Edit"}
          </button>
        ))}
      </div>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <div className={cn("min-w-0 space-y-6", previewOpen && "hidden lg:block lg:space-y-6")}>
          <Panel id="p-settings" title="Group settings">
            <GroupSettings key={JSON.stringify([group.title, group.section, group.testType, group.part, group.instructions, group.passageId, group.audioId])} group={group} passages={orgPassages} audioAssets={orgAudio} readiness={readiness} />
          </Panel>
          <Panel id="p-content" title="Content" hint="What students see above the questions: diagrams, tables, notes with blanks, shared option lists.">
            <BlocksEditor
              blocks={blocks}
              onChange={setBlocks}
              images={images}
              onImage={(img) => setExtraImages((m) => ({ ...m, [img.id]: img }))}
              questionCount={questions.length}
              dirty={dirty}
              saving={saving}
              error={blocksError}
              onSave={saveBlocks}
              onDiscard={() => { setBlocks(group.blocks); setBlocksError(null); }}
            />
          </Panel>
          <Panel id="p-questions" title={`Questions (${questions.length})`}>
            <QuestionList groupId={group.id} questions={questions} blocks={blocks} onChanged={() => router.refresh()} />
          </Panel>
          <Panel id="p-add" title="Add questions">
            <div role="tablist" aria-label="How to add" className="mb-4 inline-flex rounded-xl bg-ink-soft p-1">
              {(["single", "bulk"] as const).map((m) => (
                <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)} className={cn("rounded-lg px-4 py-1.5 text-sm font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", mode === m ? "bg-surface shadow-sm" : "text-muted")}>
                  {m === "single" ? "One question" : "Bulk add"}
                </button>
              ))}
            </div>
            {mode === "single" ? (
              <QuestionForm key={addKey} idPrefix="add" blocks={blocks} number={questions.length + 1} submitLabel={`Add as question ${questions.length + 1}`} onSubmit={addQuestion} />
            ) : (
              <BulkAdd groupId={group.id} blocks={blocks} firstNumber={questions.length + 1} onDone={() => { setMode("single"); router.refresh(); }} />
            )}
          </Panel>
        </div>

        <aside className={cn("min-w-0 lg:sticky lg:top-4 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto", !previewOpen && "hidden lg:block")} aria-label="Live student preview">
          <Card className="p-4 sm:p-5">
            <div className="mb-3 flex items-center gap-2 border-b border-border pb-3">
              <span className="h-2 w-2 animate-pulse rounded-full bg-success" aria-hidden />
              <h2 className="text-sm font-semibold">Live student preview</h2>
              {dirty && <span className="text-xs text-muted">includes unsaved content</span>}
            </div>
            <LivePreview title={group.title ?? ""} instructions={group.instructions} blocks={blocks} images={images} questions={questions} />
          </Card>
        </aside>
      </div>
    </div>
  );
}
