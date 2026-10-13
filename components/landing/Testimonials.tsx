import { TESTIMONIALS } from "./content";

const AVATAR_BG = ["#d4e84a", "#f6b9a4", "#cfe3f8"];

export function Testimonials() {
  return (
    <div role="region" aria-label="Sample learner notes" tabIndex={0}
      className="lp-scroll -mx-5 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 pt-2 lg:mx-0 lg:grid lg:grid-cols-3 lg:overflow-visible lg:px-0">
      {TESTIMONIALS.map((t, i) => (
        <figure key={t.initials} data-reveal style={{ ["--reveal-delay" as string]: `${i * 100}ms` }}
          className="lp-card flex w-[82vw] max-w-[22rem] shrink-0 snap-center flex-col p-6 text-ink lg:w-auto lg:max-w-none">
          <blockquote className="flex-1 text-[1.08rem] leading-relaxed">&ldquo;{t.quote}&rdquo;</blockquote>
          <figcaption className="mt-6 flex items-center gap-3 border-t pt-4">
            <span className="lp-avatar !m-0 !h-11 !w-11 !border-0 !text-sm" style={{ background: AVATAR_BG[i % AVATAR_BG.length] }}>{t.initials}</span>
            <span className="min-w-0 flex-1 text-sm leading-tight"><span className="block font-bold">{t.name}</span><span className="text-muted">{t.skill}</span></span>
            <span className="lp-gain">{t.gain} band</span>
          </figcaption>
        </figure>
      ))}
    </div>
  );
}
