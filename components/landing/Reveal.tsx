"use client";

import { useEffect } from "react";

/** Mount once on a page. Fades in every [data-reveal] element as it scrolls into view. */
export function RevealProvider() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) return;
    const root = document.documentElement;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" }
    );
    root.classList.add("js-reveal");
    document.querySelectorAll("[data-reveal]").forEach((el) => io.observe(el));
    return () => {
      io.disconnect();
      root.classList.remove("js-reveal");
    };
  }, []);
  return null;
}
