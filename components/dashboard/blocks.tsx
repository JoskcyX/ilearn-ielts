import * as React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

/** Page title with a teal accent bar, subtitle and a thin divider beneath. */
export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div className="mb-6 border-b border-border pb-5">
      <div className="flex items-start justify-between gap-4">
        <div className="border-l-4 border-brand pl-4">
          <h1 className="text-2xl font-extrabold md:text-3xl">{title}</h1>
          {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/** Section heading with a small accent bar. */
export function SectionHeading({ children, className }: { children: React.ReactNode; className?: string }) {
  return <h2 className={cn("mb-4 border-l-4 border-brand pl-3 text-lg font-bold", className)}>{children}</h2>;
}

/** Big blue to indigo banner with a live badge and a white call to action. */
export function Banner({
  badge = "Live", title, body, ctaLabel, ctaHref, chip,
}: { badge?: string; title: string; body: string; ctaLabel: string; ctaHref: string; chip?: React.ReactNode }) {
  return (
    <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#2f6fe0] via-accent to-[#3b2fb0] p-6 text-white md:p-8">
      <div aria-hidden className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-white/10" />
      <div className="relative flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-success px-2.5 py-0.5 text-xs font-bold">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-white" />{badge}
          </span>
          <h2 className="mt-3 text-2xl font-extrabold">{title}</h2>
          <p className="mt-2 text-white/85">{body}</p>
          <Link href={ctaHref} className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-white px-5 text-sm font-semibold text-accent transition-transform hover:-translate-y-0.5">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        {chip && <div className="shrink-0 rounded-2xl bg-white/15 px-5 py-4 text-lg font-bold backdrop-blur">{chip}</div>}
      </div>
    </section>
  );
}

const TILE = {
  teal: "bg-brand-soft text-brand",
  indigo: "bg-accent-soft text-accent",
  green: "bg-success-soft text-success",
  amber: "bg-warning-soft text-warning",
} as const;

/** White action card with a pastel icon tile and an arrow. */
export function ActionCard({
  href, icon, title, description, tone = "teal",
}: { href: string; icon: React.ReactNode; title: string; description: string; tone?: keyof typeof TILE }) {
  return (
    <Link href={href} className="group flex flex-col rounded-2xl border border-border bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start justify-between">
        <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl [&_svg]:h-5 [&_svg]:w-5", TILE[tone])}>{icon}</span>
        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" />
      </div>
      <p className="mt-6 font-display text-base font-bold">{title}</p>
      <p className="mt-1 text-sm text-muted">{description}</p>
    </Link>
  );
}
