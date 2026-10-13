import type { CSSProperties } from "react";
import { BookOpen, Headphones, Mic, PenLine, type LucideIcon } from "lucide-react";

export type SkillId = "listening" | "reading" | "writing" | "speaking";

/** Each IELTS skill owns one colour, reused in the hero, the Skills tabs and the closing card. */
export const SKILLS: Record<SkillId, { label: string; Icon: LucideIcon; from: string; to: string; glow: string; fg: string }> = {
  listening: { label: "Listening", Icon: Headphones, from: "#8b63c9", to: "#5b3a8e", glow: "rgb(91 58 142 / .55)", fg: "#ffffff" },
  reading: { label: "Reading", Icon: BookOpen, from: "#7ab8f0", to: "#4a8fd9", glow: "rgb(74 143 217 / .5)", fg: "#ffffff" },
  writing: { label: "Writing", Icon: PenLine, from: "#e4f26f", to: "#cde034", glow: "rgb(150 172 18 / .5)", fg: "#16213a" },
  speaking: { label: "Speaking", Icon: Mic, from: "#f68f62", to: "#e5583b", glow: "rgb(229 88 59 / .5)", fg: "#ffffff" },
};

export function isSkillId(id: string): id is SkillId {
  return id in SKILLS;
}

/** Rounded-square icon tile. Size it with width/height classes; the icon scales to half. */
export function SkillTile({ id, className = "", style }: { id: SkillId; className?: string; style?: CSSProperties }) {
  const s = SKILLS[id];
  return (
    <span
      className={`lp-tile ${className}`}
      aria-hidden="true"
      style={{ ["--from" as string]: s.from, ["--to" as string]: s.to, ["--glow" as string]: s.glow, ["--fg" as string]: s.fg, ...style }}
    >
      <s.Icon className="h-1/2 w-1/2" strokeWidth={2.2} />
    </span>
  );
}
