"use client";

import { useRef, useState } from "react";
import { Check } from "lucide-react";
import { MODULES } from "./content";
import { SkillTile, isSkillId } from "./marks";

export function ModuleTabs() {
  const [active, setActive] = useState(0);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const m = MODULES[active]!;

  function onKey(e: React.KeyboardEvent, i: number) {
    const fwd = e.key === "ArrowRight" || e.key === "ArrowDown";
    const back = e.key === "ArrowLeft" || e.key === "ArrowUp";
    if (!fwd && !back) return;
    e.preventDefault();
    const next = (i + (fwd ? 1 : -1) + MODULES.length) % MODULES.length;
    setActive(next);
    refs.current[next]?.focus();
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[16rem_1fr]">
      <div role="tablist" aria-label="Exam skills" className="grid grid-cols-2 gap-2 lg:grid-cols-1">
        {MODULES.map((x, i) => (
          <button key={x.id} ref={(el) => { refs.current[i] = el; }} role="tab" id={`tab-${x.id}`}
            aria-selected={i === active} aria-controls={`panel-${x.id}`} tabIndex={i === active ? 0 : -1}
            onClick={() => setActive(i)} onKeyDown={(e) => onKey(e, i)} className="lp-tab">
            {isSkillId(x.id) && <SkillTile id={x.id} className="h-11 w-11" />}
            <span className="font-display text-lg font-bold">{x.name}</span>
          </button>
        ))}
      </div>
      <div key={m.id} role="tabpanel" id={`panel-${m.id}`} aria-labelledby={`tab-${m.id}`} tabIndex={0}
        className="lp-card lp-swap grid items-center gap-8 p-6 md:grid-cols-[auto_1fr] md:p-10">
        <div className="flex items-center justify-center rounded-3xl bg-background p-8 md:p-10">
          {isSkillId(m.id) && <SkillTile id={m.id} className="h-28 w-28 -rotate-6 md:h-36 md:w-36" />}
        </div>
        <div>
          <h3 className="font-display text-[clamp(1.6rem,3.2vw,2.3rem)] font-extrabold leading-[1.08] tracking-tight">{m.tagline}</h3>
          <p className="mt-3 max-w-[34rem] text-muted">{m.body}</p>
          <ul className="mt-5 grid gap-2.5">
            {m.points.map((p) => (
              <li key={p} className="flex items-center gap-3 font-semibold"><span className="lp-check"><Check className="h-3.5 w-3.5" strokeWidth={3} aria-hidden /></span>{p}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
