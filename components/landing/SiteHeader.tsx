"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const LINKS = [
  { href: "#modules", label: "Skills" },
  { href: "#try-writing", label: "Try writing" },
  { href: "#how-it-works", label: "How it works" },
  { href: "#faq", label: "FAQ" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <header className="lp-header-wrap">
      <div className="lp-header">
        <Link href="/" aria-label="ILEARN Spaces home" className="shrink-0 whitespace-nowrap rounded-full"><Logo /></Link>
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (<a key={l.href} href={l.href} className="lp-navlink">{l.label}</a>))}
        </nav>
        <div className="flex items-center gap-1.5">
          <Link href="/login" className="lp-navlink hidden sm:block">Sign in</Link>
          <Link href="/register" className="lp-btn lp-btn-ink lp-btn-sm">Get started</Link>
          <button
            type="button"
            className="lp-iconbtn inline-flex items-center justify-center md:hidden"
            aria-label={open ? "Close menu" : "Open menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      <nav id="mobile-menu" aria-label="Mobile" hidden={!open} className="lp-menu md:hidden">
        {[...LINKS, { href: "/login", label: "Sign in" }].map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="lp-navlink">{l.label}</a>
        ))}
      </nav>
    </header>
  );
}
