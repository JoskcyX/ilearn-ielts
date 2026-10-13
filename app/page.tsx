import Link from "next/link";
import { redirect } from "next/navigation";
import { Check } from "lucide-react";
import { getOptionalUser, roleHome } from "@/lib/auth-guard";
import { Logo } from "@/components/ui/Logo";
import { SiteHeader } from "@/components/landing/SiteHeader";
import { Hero } from "@/components/landing/Hero";
import { RevealProvider } from "@/components/landing/Reveal";
import { WritingDemo } from "@/components/landing/WritingDemo";
import { ModuleTabs } from "@/components/landing/ModuleTabs";
import { Testimonials } from "@/components/landing/Testimonials";
import { Faq } from "@/components/landing/Faq";
import { SKILLS, SkillTile, type SkillId } from "@/components/landing/marks";
import { BRAND, FINAL_CTA, FOOTER_COLUMNS, STEPS, TOPICS } from "@/components/landing/content";
import "@/components/landing/landing.css";

const SKILL_ORDER: SkillId[] = ["listening", "reading", "writing", "speaking"];

function SectionHead({ title, body, dark }: { title: string; body?: string; dark?: boolean }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <h2 className="lp-h2">{title}</h2>
      {body && <p className={`mx-auto mt-4 max-w-xl text-lg ${dark ? "text-white/75" : "text-muted"}`}>{body}</p>}
    </div>
  );
}

export default async function LandingPage() {
  const user = await getOptionalUser();
  if (user) redirect(roleHome(user.role));

  return (
    <div className="lp flex min-h-screen flex-col">
      <RevealProvider />
      <SiteHeader />
      <main>
        <Hero />

        <section id="try-writing" className="lp-wrap py-20 md:py-28">
          <div className="mb-12">
            <SectionHead title="Try a Writing task right here" body="Type in the box. The word counter is real; the band beside it is a demo of how feedback is laid out." />
          </div>
          <WritingDemo />
        </section>

        <section id="modules" className="lp-wrap">
          <div className="lp-panel lp-panel-canvas">
            <div className="mb-10"><SectionHead title="Four skills, each in its exam layout" /></div>
            <ModuleTabs />
          </div>
        </section>

        <section id="how-it-works" className="lp-wrap py-20 md:py-28">
          <SectionHead title="From sign-up to feedback in four moves" />
          <ol className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {STEPS.map((s, i) => (
              <li key={s.title} data-reveal style={{ ["--reveal-delay" as string]: `${i * 90}ms` }} className="lp-step">
                <span className="lp-step-num" aria-hidden>{i + 1}</span>
                <h3 className="mt-5 text-[1.25rem] font-bold leading-snug">{s.title}</h3>
                <p className="mt-2 text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="lp-wrap">
          <div className="lp-panel lp-panel-ink lp-on-dark">
            <div className="mb-10"><SectionHead dark title="Short notes from sample learners" body="Placeholder voices to show the layout. Swap in real, permitted quotes before launch." /></div>
            <Testimonials />
          </div>
        </section>

        <div className="lp-fade-edges overflow-hidden py-12" aria-hidden="true">
          <div className="animate-marquee flex w-max items-center gap-3">
            {[...TOPICS, ...TOPICS].map((t, i) => (<span key={i} className="lp-chip">{t}</span>))}
          </div>
        </div>

        <section id="faq" className="lp-wrap grid gap-10 pb-20 pt-8 md:pb-28 lg:grid-cols-[1fr_1.7fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <h2 className="lp-h2">Questions, answered</h2>
            <p className="mt-4 max-w-sm text-lg text-muted">Plain answers about how practice and scoring work.</p>
          </div>
          <Faq />
        </section>

        <section className="lp-wrap pb-20 md:pb-28">
          <div className="lp-panel lp-panel-brand lp-on-dark grid items-center gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <h2 className="lp-h2 text-white">{FINAL_CTA.title}</h2>
              <p className="mt-5 max-w-lg text-lg text-white/90">{FINAL_CTA.body}</p>
              <Link href="/register" className="lp-btn lp-btn-ink mt-9">Create free account</Link>
            </div>
            <div className="lp-card w-full max-w-[19rem] justify-self-center p-6 text-ink lg:rotate-3 lg:justify-self-end" aria-hidden>
              <p className="font-display text-2xl font-extrabold leading-none tracking-tight">Full mock</p>
              <p className="mt-1.5 text-sm text-muted">165 minutes, all four skills</p>
              <ul className="mt-5 grid gap-3">
                {SKILL_ORDER.map((id) => (
                  <li key={id} className="flex items-center gap-3">
                    <SkillTile id={id} className="h-10 w-10" />
                    <span className="flex-1 font-semibold">{SKILLS[id].label}</span>
                    <span className="lp-check"><Check className="h-3.5 w-3.5" strokeWidth={3} /></span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t">
        <div className="lp-wrap grid gap-10 py-14 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted">{BRAND.disclaimer}</p>
          </div>
          {FOOTER_COLUMNS.map((c) => (
            <nav key={c.title} aria-label={c.title}>
              <p className="font-display font-bold">{c.title}</p>
              <ul className="mt-3 space-y-2">
                {c.links.map((l) => (<li key={l.label}><Link href={l.href} className="lp-footlink">{l.label}</Link></li>))}
              </ul>
            </nav>
          ))}
        </div>
      </footer>
    </div>
  );
}
