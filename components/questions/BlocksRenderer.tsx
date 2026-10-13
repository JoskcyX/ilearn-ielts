import type { ReactNode } from "react";
import type { Block } from "@/lib/validations/blocks";
import { ZoomableImage } from "@/components/questions/ZoomableImage";

export type RenderableBlock = Block & { url?: string };

const BLANK = /\[\[(\d+)\]\]/g;

/** Splits text on [[n]] markers and renders each blank via `renderBlank(n)`. */
export function withBlanks(text: string, renderBlank: (n: number) => ReactNode): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(BLANK)) {
    const i = m.index ?? 0;
    if (i > last) out.push(text.slice(last, i));
    out.push(<span key={`b${i}`}>{renderBlank(Number(m[1]))}</span>);
    last = i + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

export function DefaultBlank({ n }: { n: number }) {
  return (
    <span className="mx-0.5 inline-flex min-w-9 items-center justify-center rounded-md border border-dashed border-brand bg-brand/10 px-2 py-0.5 text-xs font-semibold text-brand">
      {n}
    </span>
  );
}

/**
 * Renders a group's stimulus blocks. Used by the student exam, the results
 * review and the admin live preview so all three look identical.
 *  - renderBlank: how a [[n]] anchor is drawn (default: numbered pill; the exam
 *    can pass an inline <input>).
 *  - optionLetters: A, B, C... are shown for "options" blocks.
 */
export function BlocksRenderer({
  blocks,
  renderBlank = (n) => <DefaultBlank n={n} />,
}: {
  blocks: RenderableBlock[];
  renderBlank?: (n: number) => ReactNode;
}) {
  if (!blocks.length) return null;
  return (
    <div className="space-y-4">
      {blocks.map((b) => {
        switch (b.type) {
          case "text":
            return (
              <div key={b.id} className="space-y-2 text-sm leading-7 text-foreground">
                {b.text.split(/\n{2,}/).map((para, i) => (
                  <p key={i} className="whitespace-pre-wrap">
                    {withBlanks(para, renderBlank)}
                  </p>
                ))}
              </div>
            );
          case "image":
            return (
              <figure key={b.id} className="overflow-hidden rounded-xl border border-border bg-surface">
                <ZoomableImage src={b.url ?? ""} alt={b.caption ?? "Question diagram"} />
                {b.caption && (
                  <figcaption className="border-t border-border px-3 py-2 text-xs text-muted">{b.caption}</figcaption>
                )}
              </figure>
            );
          case "table":
            return (
              <div key={b.id} className="overflow-x-auto rounded-xl border border-border">
                {b.caption && <p className="border-b border-border bg-black/[0.03] px-3 py-2 text-xs font-medium">{b.caption}</p>}
                <table className="w-full min-w-max border-collapse text-sm">
                  {b.headers.some((h) => h.trim()) && (
                    <thead>
                      <tr className="bg-black/[0.04]">
                        {b.headers.map((h, i) => (
                          <th key={i} className="border-b border-border px-3 py-2 text-left font-semibold">
                            {withBlanks(h, renderBlank)}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {b.rows.map((row, r) => (
                      <tr key={r} className="border-b border-border last:border-0">
                        {row.map((cell, c) => (
                          <td key={c} className="px-3 py-2 align-top">
                            {withBlanks(cell, renderBlank)}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            );
          case "options":
            return (
              <div key={b.id} className="rounded-xl border border-border bg-surface p-3">
                {b.title && <p className="mb-2 text-sm font-semibold">{b.title}</p>}
                <ul className="grid gap-1 text-sm sm:grid-cols-2">
                  {b.options.map((o, i) => (
                    <li key={i} className="flex gap-2">
                      <span className="w-5 font-semibold text-brand">{String.fromCharCode(65 + i)}</span>
                      <span>{o}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
        }
      })}
    </div>
  );
}
