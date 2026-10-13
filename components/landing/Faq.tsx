"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { FAQS } from "./content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="border-t" style={{ borderColor: "var(--lp-hair)" }}>
      {FAQS.map((f, i) => {
        const isOpen = open === i;
        return (
          <div key={f.q} className="lp-faq-item">
            <h3 className="text-[1.15rem] leading-snug">
              <button type="button" aria-expanded={isOpen} aria-controls={`faq-${i}`} onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-4 py-5 text-left font-display font-bold">
                <span>{f.q}</span>
                <span className="lp-faq-icon">
                  {isOpen ? <Minus className="h-4 w-4" strokeWidth={2.6} aria-hidden /> : <Plus className="h-4 w-4" strokeWidth={2.6} aria-hidden />}
                </span>
              </button>
            </h3>
            <div id={`faq-${i}`} role="region" className={`grid transition-[grid-template-rows] duration-300 motion-reduce:transition-none ${isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
              <div className="overflow-hidden"><p className="max-w-[40rem] pb-6 text-muted">{f.a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
