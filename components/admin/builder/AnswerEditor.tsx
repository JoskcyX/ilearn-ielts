"use client";

import { Plus, X } from "lucide-react";
import type { QuestionType } from "@/lib/validations/questions";
import type { Block } from "@/lib/validations/blocks";
import { CHOICE_TYPES, FILL_BLANK_TYPES, SHARED_OPTION_TYPES, TERNARY_VALUES, firstOptionsBlock, optionLetter } from "@/lib/question-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type Ans = Record<string, unknown>;
const asAns = (v: unknown): Ans => (v && typeof v === "object" ? (v as Ans) : {});

/** Purpose-built correct-answer editor for every question type. */
export function AnswerEditor({
  type,
  value,
  onChange,
  blocks,
  idPrefix = "ans",
}: {
  type: QuestionType;
  value: unknown;
  onChange: (v: unknown) => void;
  blocks: Block[];
  idPrefix?: string;
}) {
  if (CHOICE_TYPES.includes(type)) return <ChoiceEditor type={type} value={value} onChange={onChange} idPrefix={idPrefix} />;
  if (type in TERNARY_VALUES) return <TernaryEditor type={type} value={value} onChange={onChange} idPrefix={idPrefix} />;
  if (SHARED_OPTION_TYPES.includes(type)) return <SharedOptionEditor type={type} value={value} onChange={onChange} blocks={blocks} />;
  if (FILL_BLANK_TYPES.includes(type)) return <FillEditor type={type} value={value} onChange={onChange} idPrefix={idPrefix} />;
  return null;
}

function ChoiceEditor({ type, value, onChange, idPrefix }: { type: QuestionType; value: unknown; onChange: (v: unknown) => void; idPrefix: string }) {
  const v = asAns(value);
  const options = (v.options as string[]) ?? ["", "", "", ""];
  const correct = (v.correctOptionIndexes as number[]) ?? [];
  const allowMulti = type === "MULTIPLE_CHOICE";
  const set = (o: string[], c: number[]) => onChange({ options: o, correctOptionIndexes: c, _multi: v._multi });
  const isMulti = allowMulti && (correct.length > 1 || v._multi === true);

  function toggle(i: number) {
    if (isMulti) onChange({ options, correctOptionIndexes: (correct.includes(i) ? correct.filter((x) => x !== i) : [...correct, i]).sort(), _multi: true });
    else onChange({ options, correctOptionIndexes: [i], ...(allowMulti ? { _multi: false } : {}) });
  }
  function remove(i: number) {
    set(
      options.filter((_, k) => k !== i),
      correct.filter((c) => c !== i).map((c) => (c > i ? c - 1 : c))
    );
  }

  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold">Options. Mark the correct {isMulti ? "answers" : "answer"}.</legend>
      <ul className="space-y-2">
        {options.map((o, i) => (
          <li key={i} className="flex items-center gap-2">
            <input
              type={isMulti ? "checkbox" : "radio"}
              name={`${idPrefix}-correct`}
              checked={correct.includes(i)}
              onChange={() => toggle(i)}
              aria-label={`Option ${optionLetter(i)} is correct`}
              className="h-4 w-4 accent-[var(--brand)]"
            />
            <span aria-hidden className="w-5 text-sm font-semibold text-brand">{optionLetter(i)}</span>
            <Input value={o} onChange={(e) => set(options.map((x, k) => (k === i ? e.target.value : x)), correct)} placeholder={`Option ${optionLetter(i)}`} aria-label={`Option ${optionLetter(i)} text`} />
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" disabled={options.length <= 2} onClick={() => remove(i)} aria-label={`Remove option ${optionLetter(i)}`}>
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center gap-4">
        <Button type="button" variant="outline" size="sm" disabled={options.length >= 8} onClick={() => set([...options, ""], correct)}>
          <Plus className="h-4 w-4" aria-hidden /> Add option
        </Button>
        {allowMulti && (
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              className="h-4 w-4 accent-[var(--brand)]"
              checked={isMulti}
              onChange={(e) => onChange({ options, correctOptionIndexes: e.target.checked ? correct : correct.slice(0, 1), _multi: e.target.checked })}
            />
            More than one correct answer
          </label>
        )}
      </div>
    </fieldset>
  );
}

function TernaryEditor({ type, value, onChange, idPrefix }: { type: QuestionType; value: unknown; onChange: (v: unknown) => void; idPrefix: string }) {
  const current = asAns(value).correctValue;
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Correct answer</legend>
      <div className="flex flex-wrap gap-2">
        {TERNARY_VALUES[type]!.map((val) => (
          <label
            key={val}
            className={cn(
              "inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-xl border px-3.5 text-sm font-medium has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
              current === val ? "border-brand bg-brand-soft text-brand" : "border-border bg-surface"
            )}
          >
            <input type="radio" name={`${idPrefix}-tf`} className="sr-only" checked={current === val} onChange={() => onChange({ correctValue: val })} />
            {val.replace(/_/g, " ")}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function SharedOptionEditor({ type, value, onChange, blocks }: { type: QuestionType; value: unknown; onChange: (v: unknown) => void; blocks: Block[] }) {
  const opts = firstOptionsBlock(blocks)?.options ?? [];
  const current = Number(asAns(value).correctOptionIndex);
  if (opts.length < 2) {
    return (
      <p className="rounded-xl bg-warning-soft px-3 py-2.5 text-sm text-warning" role="status">
        Add an <strong>Options list</strong> block with at least two options in the content editor first. The correct letter is chosen from that list
        {type === "MAP_LABELING" ? " (add the map as an Image block too)" : ""}.
      </p>
    );
  }
  return (
    <fieldset>
      <legend className="mb-2 text-sm font-semibold">Correct letter</legend>
      <div className="grid gap-1.5 sm:grid-cols-2">
        {opts.map((o, i) => (
          <label
            key={i}
            className={cn(
              "flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-sm has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand",
              current === i ? "border-brand bg-brand-soft" : "border-border bg-surface"
            )}
          >
            <input type="radio" name="shared-option" className="sr-only" checked={current === i} onChange={() => onChange({ correctOptionIndex: i })} />
            <span className="w-5 font-bold text-brand">{optionLetter(i)}</span>
            <span>{o}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function FillEditor({ type, value, onChange, idPrefix }: { type: QuestionType; value: unknown; onChange: (v: unknown) => void; idPrefix: string }) {
  const v = asAns(value);
  const answers = (v.acceptableAnswers as string[]) ?? [""];
  const maxWords = v.maxWords as number | undefined;
  const set = (a: string[], mw = maxWords) => onChange({ acceptableAnswers: a, ...(mw ? { maxWords: mw } : {}) });
  return (
    <fieldset className="space-y-2">
      <legend className="mb-1 text-sm font-semibold">
        {type === "DIAGRAM_LABELING" ? "Accepted labels" : "Accepted answers"}
      </legend>
      <p className="text-xs text-muted">Matching ignores capital letters. Add every spelling you accept.</p>
      <ul className="space-y-2">
        {answers.map((a, i) => (
          <li key={i} className="flex items-center gap-2">
            <Input
              id={`${idPrefix}-fill-${i}`}
              value={a}
              aria-label={`Accepted answer ${i + 1}`}
              onChange={(e) => set(answers.map((x, k) => (k === i ? e.target.value : x)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (i === answers.length - 1 && a.trim()) {
                    set([...answers, ""]);
                    setTimeout(() => document.getElementById(`${idPrefix}-fill-${i + 1}`)?.focus(), 0);
                  }
                }
              }}
            />
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" disabled={answers.length <= 1} onClick={() => set(answers.filter((_, k) => k !== i))} aria-label={`Remove accepted answer ${i + 1}`}>
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-end gap-4">
        <Button type="button" variant="outline" size="sm" onClick={() => set([...answers, ""])}>
          <Plus className="h-4 w-4" aria-hidden /> Add another accepted answer
        </Button>
        <div className="flex items-center gap-2">
          <Label htmlFor={`${idPrefix}-max`} className="text-sm">Max words</Label>
          <Input id={`${idPrefix}-max`} type="number" min={1} max={10} className="h-9 w-20" placeholder="Any" value={maxWords ?? ""} onChange={(e) => set(answers, e.target.value ? Number(e.target.value) : undefined)} />
        </div>
      </div>
    </fieldset>
  );
}
