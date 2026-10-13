"use client";

import { useEffect, useState, useTransition } from "react";
import { call } from "@/lib/api";
import type { StudentFacingQuestion } from "@/lib/types/exam";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type SavedState = "idle" | "saving" | "saved" | "error";

function SaveIndicator({ state }: { state: SavedState }) {
  if (state === "idle") return null;
  return (
    <span
      className={cn(
        "text-xs",
        state === "saving" && "text-muted",
        state === "saved" && "text-success",
        state === "error" && "text-danger"
      )}
    >
      {state === "saving" ? "Saving…" : state === "saved" ? "Saved" : "Couldn't save"}
    </span>
  );
}

function hasValue(response: unknown): boolean {
  if (response === null || response === undefined) return false;
  if (typeof response === "object") {
    const r = response as Record<string, unknown>;
    if (Array.isArray(r.selectedIndexes)) return r.selectedIndexes.length > 0;
    if (typeof r.value === "string") return r.value.trim().length > 0;
    if (typeof r.text === "string") return r.text.trim().length > 0;
  }
  return Boolean(response);
}

function useAutosave(
  attemptId: string,
  questionId: string,
  initialResponse: unknown,
  onAnswered?: (questionId: string, answered: boolean) => void,
  onPendingChange?: (questionId: string, pending: boolean) => void
) {
  const [saveState, setSaveState] = useState<SavedState>("idle");
  const [, startTransition] = useTransition();

  // Report the initial answered state once, on mount, so a reloaded
  // attempt's question grid reflects what was already saved.
  useEffect(() => {
    onAnswered?.(questionId, hasValue(initialResponse));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function commit(response: unknown) {
    setSaveState("saving");
    onAnswered?.(questionId, hasValue(response));
    // A student can click "Next section" or "Submit" moments after
    // answering — before this save has actually reached the server.
    // The parent workspace uses this signal to hold the Next/Submit
    // button until every in-flight save has settled, so an answer is
    // never silently dropped by a race between autosave and navigation.
    onPendingChange?.(questionId, true);
    startTransition(async () => {
      const result = await call(`/api/exam/attempts/${attemptId}/responses`, { method: "PUT", body: { questionId, response } });
      setSaveState(result.success ? "saved" : "error");
      onPendingChange?.(questionId, false);
    });
  }
  return { saveState, commit };
}

type SharedProps = {
  attemptId: string;
  question: StudentFacingQuestion;
  initialResponse: unknown;
  disabled: boolean;
  onAnswered?: (questionId: string, answered: boolean) => void;
  onPendingChange?: (questionId: string, pending: boolean) => void;
  /** Lettered options shared by the group (first "options" block) - MATCHING / MAP_LABELING. */
  groupOptions?: string[];
};

function MultipleChoiceAnswer({ attemptId, question, initialResponse, disabled, onAnswered, onPendingChange }: SharedProps) {
  const { saveState, commit } = useAutosave(attemptId, question.id, initialResponse, onAnswered, onPendingChange);
  const initial = (initialResponse as { selectedIndexes?: number[] } | null)?.selectedIndexes ?? [];
  const [selected, setSelected] = useState(initial);
  const multi = (question.requiredSelectionCount ?? 1) > 1;

  function toggle(index: number) {
    const next = multi
      ? selected.includes(index)
        ? selected.filter((i) => i !== index)
        : [...selected, index]
      : [index];
    setSelected(next);
    commit({ selectedIndexes: next });
  }

  return (
    <div className="space-y-2">
      {multi && (
        <p className="text-xs text-muted">Choose {question.requiredSelectionCount} answers.</p>
      )}
      <div className="flex flex-wrap gap-2">
        {question.options?.map((option, i) => (
          <button
            key={i}
            type="button"
            disabled={disabled}
            onClick={() => toggle(i)}
            className={cn(
              "rounded-md border px-3 py-1.5 text-left text-sm transition-colors disabled:opacity-60",
              selected.includes(i)
                ? "border-brand bg-brand-soft text-brand"
                : "border-border bg-surface text-foreground hover:border-brand/50"
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <SaveIndicator state={saveState} />
    </div>
  );
}

function ChoiceValueAnswer({
  attemptId,
  question,
  options,
  initialResponse,
  disabled,
  onAnswered,
  onPendingChange,
}: SharedProps & { options: readonly string[] }) {
  const { saveState, commit } = useAutosave(attemptId, question.id, initialResponse, onAnswered, onPendingChange);
  const initial = (initialResponse as { value?: string } | null)?.value ?? null;
  const [value, setValue] = useState(initial);

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        {options.map((opt) => (
          <button
            key={opt}
            type="button"
            disabled={disabled}
            onClick={() => {
              setValue(opt);
              commit({ value: opt });
            }}
            className={cn(
              "rounded-md border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-60",
              value === opt
                ? "border-brand bg-brand-soft text-brand"
                : "border-border bg-surface text-foreground hover:border-brand/50"
            )}
          >
            {opt.replace("_", " ")}
          </button>
        ))}
      </div>
      <SaveIndicator state={saveState} />
    </div>
  );
}

function FillBlankAnswer({ attemptId, question, initialResponse, disabled, onAnswered, onPendingChange }: SharedProps) {
  const { saveState, commit } = useAutosave(attemptId, question.id, initialResponse, onAnswered, onPendingChange);
  const initial = (initialResponse as { value?: string } | null)?.value ?? "";

  return (
    <div className="space-y-1.5">
      <Input
        defaultValue={initial}
        disabled={disabled}
        placeholder={question.maxWords ? `No more than ${question.maxWords} word(s)` : "Your answer"}
        onBlur={(e) => commit({ value: e.currentTarget.value })}
        className="max-w-sm"
      />
      <SaveIndicator state={saveState} />
    </div>
  );
}

function FreeTextFallbackAnswer({ attemptId, question, initialResponse, disabled, onAnswered, onPendingChange }: SharedProps) {
  const { saveState, commit } = useAutosave(attemptId, question.id, initialResponse, onAnswered, onPendingChange);
  const initial = (initialResponse as { text?: string } | null)?.text ?? "";

  return (
    <div className="space-y-1.5">
      <Textarea
        defaultValue={initial}
        disabled={disabled}
        onBlur={(e) => commit({ text: e.currentTarget.value })}
      />
      <p className="text-xs text-muted">
        This question type doesn&apos;t have automatic marking yet — your answer is saved for
        your teacher to review.
      </p>
      <SaveIndicator state={saveState} />
    </div>
  );
}

function LetterAnswer({ attemptId, question, initialResponse, disabled, onAnswered, onPendingChange, groupOptions }: SharedProps) {
  const { saveState, commit } = useAutosave(attemptId, question.id, initialResponse, onAnswered, onPendingChange);
  const initial = (initialResponse as { selectedIndexes?: number[] } | null)?.selectedIndexes?.[0] ?? null;
  const [selected, setSelected] = useState<number | null>(initial);
  const options = groupOptions ?? [];

  if (options.length === 0) {
    return <p className="text-xs text-muted">The answer options for this question are not available.</p>;
  }

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Choose a letter">
        {options.map((opt, i) => (
          <button
            key={i}
            type="button"
            role="radio"
            aria-checked={selected === i}
            title={opt}
            disabled={disabled}
            onClick={() => {
              setSelected(i);
              commit({ selectedIndexes: [i] });
            }}
            className={cn(
              "flex h-9 w-9 items-center justify-center rounded-md border text-sm font-semibold transition-colors disabled:opacity-60",
              selected === i
                ? "border-brand bg-brand-soft text-brand"
                : "border-border bg-surface text-foreground hover:border-brand/50"
            )}
          >
            {String.fromCharCode(65 + i)}
          </button>
        ))}
      </div>
      <SaveIndicator state={saveState} />
    </div>
  );
}

/**
 * Compact text input rendered inside a group's blocks at a [[n]] anchor. Uses the
 * same autosave machinery as the list version; `label` is the test-wide number.
 */
export function InlineBlankInput({
  attemptId,
  question,
  initialResponse,
  disabled,
  onAnswered,
  onPendingChange,
  label,
}: SharedProps & { label: number }) {
  const { saveState, commit } = useAutosave(attemptId, question.id, initialResponse, onAnswered, onPendingChange);
  const initial = (initialResponse as { value?: string } | null)?.value ?? "";
  return (
    <span className="mx-0.5 inline-flex items-center gap-1 align-middle">
      <span className="rounded bg-ink px-1.5 py-0.5 font-mono text-[11px] font-semibold text-ink-foreground">{label}</span>
      <input
        defaultValue={initial}
        disabled={disabled}
        aria-label={`Answer for question ${label}`}
        placeholder={question.maxWords ? `max ${question.maxWords}` : "answer"}
        onBlur={(e) => commit({ value: e.currentTarget.value })}
        className={cn(
          "h-7 w-32 rounded-md border bg-surface px-2 text-sm outline-none focus:border-brand",
          saveState === "error" ? "border-danger" : saveState === "saved" ? "border-success/60" : "border-border"
        )}
      />
    </span>
  );
}

const FILL_BLANK_TYPES = new Set([
  "SHORT_ANSWER",
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FORM_COMPLETION",
  "FLOW_CHART_COMPLETION",
  "DIAGRAM_LABELING",
]);

/** Completion-style types whose input can sit inline at a [[n]] anchor. */
export const INLINE_CAPABLE_TYPES = FILL_BLANK_TYPES;

/**
 * Dispatches to the right answer widget for this question's type, and
 * autosaves every change via the responses API. Each branch
 * below is its own component so every one of them calls its hooks
 * unconditionally — this component itself holds no hooks. An optional
 * `onAnswered` callback lets a parent (the question-number grid) track
 * answered/unanswered state without owning the response itself.
 */
export function AnswerField(props: SharedProps) {
  const { question } = props;

  if (question.questionType === "MULTIPLE_CHOICE" || question.questionType === "MATCHING_HEADINGS") {
    return <MultipleChoiceAnswer {...props} />;
  }

  if (question.questionType === "MATCHING" || question.questionType === "MAP_LABELING") {
    return <LetterAnswer {...props} />;
  }

  if (question.questionType === "TRUE_FALSE_NOT_GIVEN") {
    return <ChoiceValueAnswer {...props} options={["TRUE", "FALSE", "NOT_GIVEN"]} />;
  }

  if (question.questionType === "YES_NO_NOT_GIVEN") {
    return <ChoiceValueAnswer {...props} options={["YES", "NO", "NOT_GIVEN"]} />;
  }

  if (FILL_BLANK_TYPES.has(question.questionType)) {
    return <FillBlankAnswer {...props} />;
  }

  return <FreeTextFallbackAnswer {...props} />;
}
