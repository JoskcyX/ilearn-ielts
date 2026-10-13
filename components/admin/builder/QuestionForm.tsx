"use client";

import { useState } from "react";
import type { QuestionType } from "@/lib/validations/questions";
import type { Block } from "@/lib/validations/blocks";
import type { BuilderQuestion } from "@/lib/types/admin-content";
import {
  FILL_BLANK_TYPES, SHARED_OPTION_TYPES, TYPE_FAMILIES, TYPE_HINTS, answerProblem, cleanAnswer, convertAnswer, defaultAnswer, firstOptionsBlock, typeLabel,
} from "@/lib/question-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { AnswerEditor } from "./AnswerEditor";

export type QuestionPayload = {
  questionType: QuestionType;
  questionText: string;
  marks: number;
  difficulty: string | null;
  skill: string | null;
  explanation: string | null;
  correctAnswer: unknown;
};

/** Add / edit one question: type chooser by family, text, answer editor, optional extras. */
export function QuestionForm({
  initial,
  blocks,
  number,
  submitLabel,
  onSubmit,
  onCancel,
  idPrefix,
}: {
  initial?: BuilderQuestion;
  blocks: Block[];
  number: number;
  submitLabel: string;
  onSubmit: (p: QuestionPayload) => Promise<string | null>;
  onCancel?: () => void;
  idPrefix: string;
}) {
  const [type, setType] = useState<QuestionType>(initial?.questionType ?? "MULTIPLE_CHOICE");
  const [text, setText] = useState(initial?.questionText ?? "");
  const [marks, setMarks] = useState(initial?.marks ?? 1);
  const [answer, setAnswer] = useState<unknown>(initial?.correctAnswer ?? defaultAnswer(type));
  const [skill, setSkill] = useState(initial?.skill ?? "");
  const [difficulty, setDifficulty] = useState(initial?.difficulty ?? "");
  const [explanation, setExplanation] = useState(initial?.explanation ?? "");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const optionCount = firstOptionsBlock(blocks)?.options.length ?? 0;

  function chooseType(t: QuestionType) {
    if (t === type) return;
    setAnswer((a: unknown) => convertAnswer(type, t, a));
    setType(t);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!text.trim()) return setError("Write the question text.");
    const problem = answerProblem(type, answer, optionCount);
    if (problem) return setError(problem);
    setBusy(true);
    const err = await onSubmit({
      questionType: type,
      questionText: text.trim(),
      marks,
      difficulty: difficulty.trim() || null,
      skill: skill.trim() || null,
      explanation: explanation.trim() || null,
      correctAnswer: cleanAnswer(type, answer),
    });
    setBusy(false);
    if (err) setError(err);
  }

  const textLabel = FILL_BLANK_TYPES.includes(type)
    ? "Question or label"
    : SHARED_OPTION_TYPES.includes(type)
      ? "Item to match"
      : "Question text";

  return (
    <form onSubmit={submit} className="space-y-5" aria-label={initial ? `Edit question ${number}` : "Add a question"}>
      <fieldset className="space-y-3">
        <legend className="text-sm font-semibold">Question type</legend>
        {TYPE_FAMILIES.map((f) => (
          <div key={f.label}>
            <p className="mb-1.5 text-xs font-medium text-muted">{f.label}</p>
            <div className="flex flex-wrap gap-1.5">
              {f.types.map((t) => (
                <label
                  key={t}
                  className={cn(
                    "cursor-pointer rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
                    type === t ? "border-brand bg-brand text-brand-foreground" : "border-border bg-surface hover:bg-ink-soft"
                  )}
                >
                  <input type="radio" name={`${idPrefix}-type`} className="sr-only" checked={type === t} onChange={() => chooseType(t)} />
                  {typeLabel(t)}
                </label>
              ))}
            </div>
          </div>
        ))}
        <p className="text-sm text-muted">{TYPE_HINTS[type]}</p>
      </fieldset>

      <div className="space-y-1.5">
        <Label htmlFor={`${idPrefix}-text`}>{textLabel}</Label>
        <Textarea id={`${idPrefix}-text`} className="min-h-20" value={text} onChange={(e) => setText(e.target.value)} placeholder={FILL_BLANK_TYPES.includes(type) ? "e.g. The conference starts on ____" : "Write what the student sees"} />
      </div>

      <AnswerEditor type={type} value={answer} onChange={setAnswer} blocks={blocks} idPrefix={idPrefix} />

      <div className="flex items-end gap-4">
        <div className="space-y-1.5">
          <Label htmlFor={`${idPrefix}-marks`}>Marks</Label>
          <Input id={`${idPrefix}-marks`} type="number" min={1} max={10} className="w-24" value={marks} onChange={(e) => setMarks(Math.min(10, Math.max(1, Number(e.target.value) || 1)))} />
        </div>
      </div>

      <details className="rounded-xl border border-border bg-ink-soft/40 px-3 py-2" open={!!(initial?.skill || initial?.difficulty || initial?.explanation)}>
        <summary className="cursor-pointer text-sm font-semibold">Skill, difficulty and explanation</summary>
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-skill`}>Skill</Label>
              <Input id={`${idPrefix}-skill`} value={skill} onChange={(e) => setSkill(e.target.value)} placeholder="e.g. Scanning" maxLength={80} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor={`${idPrefix}-diff`}>Difficulty</Label>
              <Input id={`${idPrefix}-diff`} value={difficulty} onChange={(e) => setDifficulty(e.target.value)} placeholder="e.g. Medium" list={`${idPrefix}-diff-list`} maxLength={40} />
              <datalist id={`${idPrefix}-diff-list`}>
                <option value="Easy" />
                <option value="Medium" />
                <option value="Hard" />
              </datalist>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor={`${idPrefix}-expl`}>Explanation shown in results</Label>
            <Textarea id={`${idPrefix}-expl`} className="min-h-20" value={explanation} onChange={(e) => setExplanation(e.target.value)} maxLength={2000} />
          </div>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" disabled={busy}>
          {busy ? "Saving…" : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        {error && (
          <span role="alert" className="text-sm text-danger">
            {error}
          </span>
        )}
      </div>
    </form>
  );
}
