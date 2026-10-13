"use client";

import { useMemo, useState } from "react";
import { BookText, Link2, ListChecks, Target, type LucideIcon } from "lucide-react";
import { CRITERIA, WRITING_DEMO } from "./content";

const CRITERIA_ICONS: LucideIcon[] = [Target, Link2, BookText, ListChecks];

/** Demo only: looks at length and word variety, nothing else. Never a real score. */
function demoBand(words: string[]) {
  const n = words.length;
  if (n < 20) return null;
  const unique = new Set(words.map((w) => w.toLowerCase().replace(/[^a-z']/g, ""))).size;
  const variety = unique / n;
  const length = Math.min(n / WRITING_DEMO.minWords, 1);
  const raw = 4 + length * 2 + Math.min(variety, 0.8) * 1.25;
  return Math.min(7, Math.round(raw * 2) / 2);
}

export function WritingDemo() {
  const [text, setText] = useState(WRITING_DEMO.starter);
  const words = useMemo(() => text.trim().split(/\s+/).filter(Boolean), [text]);
  const band = demoBand(words);
  const pct = Math.min(100, Math.round((words.length / WRITING_DEMO.minWords) * 100));
  const unique = new Set(words.map((w) => w.toLowerCase())).size;
  const variety = words.length ? Math.round((unique / words.length) * 100) : 0;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-stretch">
        <div className="lp-card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 bg-brand-soft px-5 py-3">
            <p className="font-display text-lg font-bold">{WRITING_DEMO.title}</p>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-semibold text-[#0a5f57]">40 minutes in the real test</span>
          </div>
          <p className="border-b px-5 py-4 text-[1.08rem] font-medium leading-snug md:px-6">{WRITING_DEMO.prompt}</p>
          <label htmlFor="demo-essay" className="sr-only">Your essay</label>
          <textarea id="demo-essay" value={text} onChange={(e) => setText(e.target.value)} rows={9} spellCheck={false}
            className="lp-ruled block w-full resize-y border-0 px-5 py-0 text-[1.05rem] text-ink outline-none focus-visible:shadow-[inset_0_0_0_3px_var(--brand)] md:px-6"
            style={{ lineHeight: "32px" }} />
          <div className="flex items-center gap-4 border-t px-5 py-4 md:px-6">
            <div className="lp-meter flex-1" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100} aria-label="Progress to minimum word count">
              <div style={{ width: `${pct}%` }} />
            </div>
            <p className="shrink-0 text-sm tabular-nums text-muted" aria-live="polite"><strong className="text-base text-ink">{words.length}</strong> / {WRITING_DEMO.minWords} words</p>
          </div>
        </div>

        <div className="lp-panel-ink lp-on-dark flex flex-col rounded-[2rem] p-7 md:p-8">
          <span className="self-start rounded-full border border-[var(--chartreuse)] px-3 py-1 text-sm font-bold text-[var(--chartreuse)]">Demo only, not a real score</span>
          <div className="mt-6 flex items-end gap-3">
            <p className="font-display text-[6.5rem] font-extrabold leading-[.8] tracking-tight text-[var(--chartreuse)] tabular-nums">{band ? band.toFixed(1) : "–"}</p>
            <p className="pb-1 text-sm text-white/70">demo band</p>
          </div>
          <div className="mt-auto pt-8">
            <div className="mb-5 border-t border-dashed" style={{ borderColor: "rgb(255 255 255 / .25)" }} />
            <p className="text-sm leading-relaxed text-white/85">
              {band ? `Based only on length and word variety (${variety}% unique words). The real exam judges all four criteria below.` : "Write at least 20 words to see the demo estimate."}
            </p>
          </div>
        </div>
      </div>

      <h3 className="mt-16 text-center font-display text-[clamp(1.5rem,3vw,2rem)] font-bold">What a real marker looks for</h3>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CRITERIA.map((c, i) => {
          const Icon = CRITERIA_ICONS[i] ?? Target;
          return (
            <li key={c.name} className="lp-card p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-[#0a5f57]"><Icon className="h-5 w-5" aria-hidden /></span>
              <p className="mt-4 font-display text-lg font-bold leading-tight">{c.name}</p>
              <p className="mt-2 text-[.95rem] text-muted">{c.body}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
