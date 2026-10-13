"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, Copy, Pencil, Trash2 } from "lucide-react";
import { call } from "@/lib/api";
import type { Block } from "@/lib/validations/blocks";
import type { BuilderQuestion } from "@/lib/types/admin-content";
import { answerSummary, typeLabel } from "@/lib/question-builder";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContentStatusControl } from "@/components/admin/questions/ContentStatusControl";
import { ConfirmDialog } from "./Modal";
import { QuestionForm, type QuestionPayload } from "./QuestionForm";

/** Numbered question list with inline edit, duplicate, reorder, status and delete. */
export function QuestionList({
  groupId,
  questions,
  blocks,
  onChanged,
}: {
  groupId: string;
  questions: BuilderQuestion[];
  blocks: Block[];
  onChanged: () => void;
}) {
  const [list, setList] = useState(questions);
  const [prev, setPrev] = useState(questions);
  if (prev !== questions) {
    setPrev(questions);
    setList(questions);
  }
  const [editing, setEditing] = useState<string | null>(null);
  const [toDelete, setToDelete] = useState<BuilderQuestion | null>(null);
  const [delPending, setDelPending] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [live, setLive] = useState("");

  async function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= list.length) return;
    const before = list;
    const next = [...list];
    [next[i], next[j]] = [next[j]!, next[i]!];
    setList(next);
    setError(null);
    const r = await call("/api/admin/questions/reorder", { body: { questionGroupId: groupId, orderedIds: next.map((q) => q.id) } });
    if (!r.success) {
      setList(before);
      return setError(r.error);
    }
    setLive(`Question moved to number ${j + 1}.`);
    onChanged();
  }

  async function save(q: BuilderQuestion, p: QuestionPayload): Promise<string | null> {
    const r = await call(`/api/admin/questions/${q.id}`, { method: "PUT", body: p });
    if (!r.success) return r.error;
    setEditing(null);
    onChanged();
    return null;
  }

  async function duplicate(q: BuilderQuestion) {
    setError(null);
    const r = await call("/api/admin/questions", {
      body: {
        questionGroupId: groupId,
        questionType: q.questionType,
        questionText: q.questionText,
        orderIndex: list.length,
        marks: q.marks,
        difficulty: q.difficulty ?? undefined,
        skill: q.skill ?? undefined,
        explanation: q.explanation ?? undefined,
        correctAnswer: q.correctAnswer,
      },
    });
    if (!r.success) return setError(r.error);
    setLive("Question duplicated at the end of the list.");
    onChanged();
  }

  async function remove() {
    if (!toDelete) return;
    setDelPending(true);
    setDelError(null);
    const r = await call(`/api/admin/questions/${toDelete.id}`, { method: "DELETE" });
    setDelPending(false);
    if (!r.success) return setDelError(r.error);
    setList((l) => l.filter((x) => x.id !== toDelete.id));
    setToDelete(null);
    onChanged();
  }

  if (list.length === 0)
    return <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">No questions yet. Add the first one below.</p>;

  return (
    <div className="space-y-3">
      <p className="sr-only" aria-live="polite">{live}</p>
      {error && (
        <p role="alert" className="rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <ol className="space-y-2">
        {list.map((q, i) => (
          <li key={q.id} className="rounded-xl border border-border bg-surface">
            <div className="flex gap-3 p-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-soft text-sm font-bold text-brand" aria-label={`Question ${i + 1}`}>
                {i + 1}
              </span>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">{typeLabel(q.questionType)}</Badge>
                  <span className="text-xs text-muted">{q.marks} {q.marks === 1 ? "mark" : "marks"}</span>
                  <span className="ml-auto">
                    <ContentStatusControl id={q.id} status={q.status} endpoint="/api/admin/questions" />
                  </span>
                </div>
                <p className="whitespace-pre-wrap break-words text-sm">{q.questionText}</p>
                <p className="text-xs text-muted">
                  <span className="font-semibold text-foreground">Answer:</span> {answerSummary(q.questionType, q.correctAnswer, blocks)}
                </p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1 border-t border-border px-2 py-1.5">
              <Button type="button" variant="ghost" size="sm" onClick={() => setEditing(editing === q.id ? null : q.id)} aria-expanded={editing === q.id}>
                <Pencil className="h-3.5 w-3.5" aria-hidden /> {editing === q.id ? "Close editor" : "Edit"}
              </Button>
              <Button type="button" variant="ghost" size="sm" onClick={() => duplicate(q)}>
                <Copy className="h-3.5 w-3.5" aria-hidden /> Duplicate
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" disabled={i === 0} onClick={() => move(i, -1)} aria-label={`Move question ${i + 1} up`}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" className="h-9 w-9" disabled={i === list.length - 1} onClick={() => move(i, 1)} aria-label={`Move question ${i + 1} down`}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="ml-auto text-danger hover:bg-danger-soft" onClick={() => { setDelError(null); setToDelete(q); }}>
                <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
              </Button>
            </div>
            {editing === q.id && (
              <div className="border-t border-border bg-ink-soft/30 p-4">
                <QuestionForm idPrefix={`edit-${q.id}`} initial={q} blocks={blocks} number={i + 1} submitLabel="Save question" onSubmit={(p) => save(q, p)} onCancel={() => setEditing(null)} />
              </div>
            )}
          </li>
        ))}
      </ol>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this question?"
        description={toDelete ? `Question ${list.findIndex((x) => x.id === toDelete.id) + 1} will be removed and the questions after it renumber. Blanks written as [[n]] in the content may need updating.` : ""}
        confirmLabel="Delete question"
        onConfirm={remove}
        pending={delPending}
        error={delError}
      />
    </div>
  );
}
