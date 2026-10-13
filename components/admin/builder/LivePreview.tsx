"use client";

import type { Block } from "@/lib/validations/blocks";
import type { BuilderQuestion } from "@/lib/types/admin-content";
import { BlocksRenderer, type RenderableBlock } from "@/components/questions/BlocksRenderer";
import { CHOICE_TYPES, FILL_BLANK_TYPES, SHARED_OPTION_TYPES, TERNARY_VALUES, anchoredNumbers, firstOptionsBlock, optionLetter } from "@/lib/question-builder";
import type { ImageMap } from "./BlocksEditor";

type Ans = Record<string, unknown>;

function BlankInput({ n }: { n: number }) {
  return (
    <input
      disabled
      aria-label={`Answer ${n}`}
      placeholder={String(n)}
      className="mx-0.5 h-7 w-28 rounded-md border border-border bg-white px-2 text-center text-sm placeholder:font-semibold placeholder:text-brand"
    />
  );
}

/** Read-only approximation of what students see in the exam. */
export function LivePreview({
  title,
  instructions,
  blocks,
  images,
  questions,
}: {
  title: string;
  instructions: string;
  blocks: Block[];
  images: ImageMap;
  questions: BuilderQuestion[];
}) {
  const renderable: RenderableBlock[] = blocks.flatMap<RenderableBlock>((b) => {
    if (b.type !== "image") return [b];
    const img = images[b.imageId];
    return img ? [{ ...b, url: img.url }] : [];
  });
  const anchored = anchoredNumbers(blocks);
  const options = firstOptionsBlock(blocks)?.options ?? [];
  const shown = questions.map((q, i) => ({ q, n: i + 1 })).filter(({ q, n }) => !(anchored.has(n) && FILL_BLANK_TYPES.includes(q.questionType)));

  return (
    <div className="space-y-4" aria-label="Student preview">
      <div>
        <h3 className="font-display text-lg font-bold">{title || "Untitled group"}</h3>
        {instructions && <p className="mt-1 whitespace-pre-wrap text-sm italic text-muted">{instructions}</p>}
      </div>
      <BlocksRenderer blocks={renderable} renderBlank={(n) => <BlankInput n={n} />} />
      {questions.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-4 text-center text-sm text-muted">Questions appear here as you add them.</p>
      ) : (
        <ol className="space-y-4">
          {shown.map(({ q, n }) => {
            const a = (q.correctAnswer && typeof q.correctAnswer === "object" ? q.correctAnswer : {}) as Ans;
            return (
              <li key={q.id} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-ink text-xs font-bold text-ink-foreground">{n}</span>
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="whitespace-pre-wrap text-sm">{q.questionText}</p>
                  {CHOICE_TYPES.includes(q.questionType) && (
                    <ul className="space-y-1.5">
                      {((a.options as string[]) ?? []).map((o, i) => (
                        <li key={i} className="flex items-start gap-2 rounded-lg border border-border px-3 py-1.5 text-sm">
                          <span className="font-semibold text-brand">{optionLetter(i)}</span> {o}
                        </li>
                      ))}
                    </ul>
                  )}
                  {q.questionType in TERNARY_VALUES && (
                    <div className="flex flex-wrap gap-1.5">
                      {TERNARY_VALUES[q.questionType]!.map((v) => (
                        <span key={v} className="rounded-lg border border-border px-3 py-1 text-sm">{v.replace(/_/g, " ")}</span>
                      ))}
                    </div>
                  )}
                  {SHARED_OPTION_TYPES.includes(q.questionType) && (
                    <select disabled aria-label={`Answer ${n}`} className="h-9 rounded-lg border border-border bg-white px-2 text-sm">
                      <option>Choose a letter{options.length ? ` (A-${optionLetter(options.length - 1)})` : ""}</option>
                    </select>
                  )}
                  {FILL_BLANK_TYPES.includes(q.questionType) && <BlankInput n={n} />}
                </div>
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}
