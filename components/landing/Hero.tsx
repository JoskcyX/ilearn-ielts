import Link from "next/link";
import { Timer } from "lucide-react";
import { HERO, STATS } from "./content";
import { CountUp } from "./CountUp";
import { SKILLS, SkillTile, type SkillId } from "./marks";

/** Four skill tiles: a centred row on small screens, floating in the corners from lg up. */
const TILES: { id: SkillId; pos: string; tilt: number; delay: number; bob: number }[] = [
  { id: "listening", pos: "tl", tilt: -10, delay: 0.1, bob: 6 },
  { id: "reading", pos: "tr", tilt: 9, delay: 0.22, bob: 7 },
  { id: "writing", pos: "bl", tilt: 8, delay: 0.34, bob: 5.5 },
  { id: "speaking", pos: "br", tilt: -9, delay: 0.46, bob: 6.5 },
];

const AVATAR_BG = ["#d4e84a", "#dff2ee", "#f6b9a4", "#cfe3f8"];

export function Hero() {
  return (
    <>
      <section className="relative pb-16 pt-10 md:pb-20 md:pt-14 lg:pb-28 lg:pt-20">
        <div className="lp-wrap relative">
          <div className="lp-tiles" aria-hidden="true">
            {TILES.map((t) => (
              <div
                key={t.id}
                className="lp-tilebox"
                data-pos={t.pos}
                style={{ ["--tilt" as string]: `${t.tilt}deg`, ["--d" as string]: `${t.delay}s`, ["--bob" as string]: `${t.bob}s` }}
              >
                <SkillTile id={t.id} />
                <span className="lp-tilelabel">{SKILLS[t.id].label}</span>
              </div>
            ))}
          </div>

          <div className="relative mx-auto flex max-w-[50rem] flex-col items-center text-center">
            <span className="lp-badge">
              <Timer className="h-4 w-4 text-brand" strokeWidth={2.4} aria-hidden />
              {HERO.badge}
            </span>
            <h1 className="lp-hero-title mt-7">
              {HERO.titleBefore}
              <span className="block text-brand [text-wrap:balance]">{HERO.titleAccent}</span>
            </h1>
            <p className="mt-6 max-w-[34rem] text-[1.15rem] leading-relaxed text-muted">{HERO.subcopy}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
              <Link href="/register" className="lp-btn lp-btn-brand">{HERO.primaryCta}</Link>
              <Link href="/login" className="lp-btn lp-btn-ghost">{HERO.secondaryCta}</Link>
            </div>
            <div className="mt-10 flex items-center justify-center gap-3">
              <div className="flex" aria-hidden="true">
                {HERO.proofInitials.map((i, n) => (
                  <span key={i} className="lp-avatar" style={{ background: AVATAR_BG[n % AVATAR_BG.length] }}>{i}</span>
                ))}
              </div>
              <p className="text-[.95rem] font-semibold text-muted">{HERO.proofText}</p>
            </div>
          </div>
        </div>
      </section>

      <section aria-label="Test format at a glance" className="lp-wrap">
        <dl className="lp-stats">
          {STATS.map((s) => (
            <div key={s.label} className="lp-stat flex flex-col-reverse justify-end gap-2">
              <dt className="max-w-[13rem] text-[.98rem] leading-snug text-muted">{s.label}</dt>
              <dd className="lp-stat-num"><CountUp value={s.value} suffix={s.suffix} /></dd>
            </div>
          ))}
        </dl>
      </section>
    </>
  );
}
