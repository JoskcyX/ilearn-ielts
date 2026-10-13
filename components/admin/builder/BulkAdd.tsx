"use client";

import { useMemo, useState } from "react";
import { call } from "@/lib/api";
import type { QuestionType } from "@/lib/validations/questions";
import type { Block } from "@/lib/validations/blocks";
import { TYPE_FAMILIES, answerSummary, bulkFormatHint, firstOptionsBlock, parseBulk, typeLabel } from "@/lib/question-builder";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { selectClass } from "./Modal";

/** One question per line; shows a checked preview table before anything is saved. */
export function BulkAdd({
  groupId,
  blocks,
  firstNumber,
  onDone,
}: {
  groupId: string;
  blocks: Block[];
  firstNumber: number;
  onDone: () => void;
}) {
  const [type, setType] = useState<QuestionType>("SENTENCE_COMPLETION");
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const optionCount = firstOptionsBlock(blocks)?.options.length ?? 0;
  const rows = useMemo(() => parseBulk(type, input, optionCount), [type, input, optionCount]);
  const bad = rows.filter((r) => r.error).length;

  async function save() {
    setBusy(true);
    setError(null);
    const r = await call<{ ids: string[] }>("/api/admin/questions/bulk", {
      body: {
        questionGroupId: groupId,
        questions: rows.map((x) => ({ questionType: type, questionText: x.text, marks: 1, correctAnswer: x.answer })),
      },
    });
    setBusy(false);
    if (!r.success) return setError(r.error);
    setInput("");
    onDone();
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[minmax(0,16rem)_1fr] sm:items-end">
        <div className="space-y-1.5">
          <Label htmlFor="bulk-type">Question type for every line</Label>
          <select id="bulk-type" className={selectClass} value={type} onChange={(e) => setType(e.target.value as QuestionType)}>
            {TYPE_FAMILIES.map((f) => (
              <optgroup key={f.label} label={f.label}>
                {f.types.map((t) => (
                  <option key={t} value={t}>{typeLabel(t)}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>
        <p className="text-sm text-muted">
          Format: <code className="rounded bg-ink-soft px-1.5 py-0.5 text-xs">{bulkFormatHint(type)}</code>
        </p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="bulk-text">Questions, one per line</Label>
        <Textarea id="bulk-text" className="min-h-40 font-mono text-[13px]" value={input} onChange={(e) => setInput(e.target.value)} placeholder={"The festival takes place in | March\nTickets cost | 12 / twelve pounds"} />
      </div>

      {rows.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <caption className="sr-only">Preview of questions to add</caption>
            <thead className="bg-ink-soft text-xs text-muted">
              <tr>
                <th className="px-3 py-2 font-semibold">No.</th>
                <th className="px-3 py-2 font-semibold">Question</th>
                <th className="px-3 py-2 font-semibold">Correct answer</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.line} className="border-t border-border align-top">
                  <td className="px-3 py-2 font-semibold">{firstNumber + i}</td>
                  <td className="px-3 py-2">{r.text || <span className="text-muted">(empty)</span>}</td>
                  <td className="px-3 py-2">
                    {r.error ? <span className="text-danger">Line {r.line}: {r.error}</span> : answerSummary(type, r.answer, blocks)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="brand" onClick={save} disabled={busy || rows.length === 0 || bad > 0}>
          {busy ? "Adding…" : `Add ${rows.length} ${rows.length === 1 ? "question" : "questions"}`}
        </Button>
        {bad > 0 && <span className="text-sm text-danger">Fix {bad} {bad === 1 ? "line" : "lines"} to continue.</span>}
        {error && <span role="alert" className="text-sm text-danger">{error}</span>}
      </div>
    </div>
  );
}
