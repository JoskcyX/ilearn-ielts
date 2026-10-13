// Pure helpers for the admin Question Builder (no React, no I/O).
import type { Block } from "@/lib/validations/blocks";
import { QUESTION_TYPE_LABELS, type QuestionType } from "@/lib/validations/questions";

export const FILL_BLANK_TYPES: QuestionType[] = [
  "SHORT_ANSWER",
  "SENTENCE_COMPLETION",
  "SUMMARY_COMPLETION",
  "NOTE_COMPLETION",
  "TABLE_COMPLETION",
  "FORM_COMPLETION",
  "FLOW_CHART_COMPLETION",
  "DIAGRAM_LABELING",
];
export const CHOICE_TYPES: QuestionType[] = ["MULTIPLE_CHOICE", "MATCHING_HEADINGS"];
export const SHARED_OPTION_TYPES: QuestionType[] = ["MATCHING", "MAP_LABELING"];

export type TypeFamily = { label: string; types: QuestionType[] };
export const TYPE_FAMILIES: TypeFamily[] = [
  { label: "Choose an answer", types: ["MULTIPLE_CHOICE", "TRUE_FALSE_NOT_GIVEN", "YES_NO_NOT_GIVEN"] },
  { label: "Match from a list", types: ["MATCHING_HEADINGS", "MATCHING", "MAP_LABELING"] },
  {
    label: "Write the answer",
    types: [
      "SENTENCE_COMPLETION",
      "SUMMARY_COMPLETION",
      "NOTE_COMPLETION",
      "TABLE_COMPLETION",
      "FORM_COMPLETION",
      "FLOW_CHART_COMPLETION",
      "DIAGRAM_LABELING",
      "SHORT_ANSWER",
    ],
  },
];

export const TYPE_HINTS: Record<QuestionType, string> = {
  MULTIPLE_CHOICE: "Student picks from options you write for this question.",
  MATCHING_HEADINGS: "Student picks a heading from options you write for this question.",
  MATCHING: "Student picks a letter from the group's shared Options block.",
  MAP_LABELING: "Student picks a letter from the Options block; add the map as an Image block.",
  TRUE_FALSE_NOT_GIVEN: "Student picks True, False or Not Given.",
  YES_NO_NOT_GIVEN: "Student picks Yes, No or Not Given.",
  SHORT_ANSWER: "Student types a short answer.",
  SENTENCE_COMPLETION: "Student types the missing words.",
  SUMMARY_COMPLETION: "Put [[n]] in a Text block where the blank goes.",
  NOTE_COMPLETION: "Put [[n]] in a Text block where the blank goes.",
  TABLE_COMPLETION: "Put [[n]] in a Table cell where the blank goes.",
  FORM_COMPLETION: "Put [[n]] in a Text or Table block where the blank goes.",
  FLOW_CHART_COMPLETION: "Add the flow chart as an Image block, or write it as Text with [[n]].",
  DIAGRAM_LABELING: "Add the diagram as an Image block; students type the label for each number.",
};

export function typeLabel(t: QuestionType) {
  return QUESTION_TYPE_LABELS[t];
}

export const TERNARY_VALUES: Partial<Record<QuestionType, string[]>> = {
  TRUE_FALSE_NOT_GIVEN: ["TRUE", "FALSE", "NOT_GIVEN"],
  YES_NO_NOT_GIVEN: ["YES", "NO", "NOT_GIVEN"],
};

export function defaultAnswer(t: QuestionType): unknown {
  if (CHOICE_TYPES.includes(t)) return { options: ["", "", "", ""], correctOptionIndexes: [] };
  if (t in TERNARY_VALUES) return { correctValue: TERNARY_VALUES[t]![0] };
  if (SHARED_OPTION_TYPES.includes(t)) return { correctOptionIndex: -1 };
  return { acceptableAnswers: [""] };
}

/** Keeps the old answer when switching between types that share a shape. */
export function convertAnswer(from: QuestionType, to: QuestionType, value: unknown): unknown {
  const sameShape = (a: QuestionType, b: QuestionType) =>
    (FILL_BLANK_TYPES.includes(a) && FILL_BLANK_TYPES.includes(b)) ||
    (CHOICE_TYPES.includes(a) && CHOICE_TYPES.includes(b)) ||
    (SHARED_OPTION_TYPES.includes(a) && SHARED_OPTION_TYPES.includes(b)) ||
    (a in TERNARY_VALUES && b in TERNARY_VALUES && a === b);
  return sameShape(from, to) ? value : defaultAnswer(to);
}

export function optionLetter(i: number) {
  return String.fromCharCode(65 + i);
}

export function firstOptionsBlock(blocks: Block[]): Extract<Block, { type: "options" }> | null {
  return (blocks.find((b) => b.type === "options") as Extract<Block, { type: "options" }>) ?? null;
}

type Ans = Record<string, unknown>;
const asAns = (v: unknown): Ans => (v && typeof v === "object" ? (v as Ans) : {});

/** Turns the editor value into the payload sent to the API (trims, drops blanks). */
export function cleanAnswer(t: QuestionType, value: unknown): unknown {
  const v = asAns(value);
  if (CHOICE_TYPES.includes(t)) {
    const opts = ((v.options as string[]) ?? []).map((o) => o.trim());
    const idx = ((v.correctOptionIndexes as number[]) ?? []).filter((i) => opts[i]);
    // re-index after dropping empty options
    const keep: number[] = [];
    opts.forEach((o, i) => o && keep.push(i));
    return {
      options: keep.map((i) => opts[i]),
      correctOptionIndexes: idx.map((i) => keep.indexOf(i)),
    };
  }
  if (FILL_BLANK_TYPES.includes(t)) {
    const answers = ((v.acceptableAnswers as string[]) ?? []).map((a) => a.trim()).filter(Boolean);
    const maxWords = Number(v.maxWords);
    return { acceptableAnswers: answers, ...(maxWords > 0 ? { maxWords } : {}) };
  }
  return value;
}

/** Client-side check; returns a message or null. The server remains the authority. */
export function answerProblem(t: QuestionType, value: unknown, optionCount: number): string | null {
  const v = cleanAnswer(t, value) as Ans;
  if (CHOICE_TYPES.includes(t)) {
    if (((v.options as string[]) ?? []).length < 2) return "Write at least two options.";
    if (((v.correctOptionIndexes as number[]) ?? []).length < 1) return "Mark the correct option.";
  } else if (FILL_BLANK_TYPES.includes(t)) {
    if (((v.acceptableAnswers as string[]) ?? []).length < 1) return "Add at least one accepted answer.";
  } else if (SHARED_OPTION_TYPES.includes(t)) {
    if (optionCount < 2) return "Add an Options block (two or more options) to the content first.";
    const i = Number(v.correctOptionIndex);
    if (!(i >= 0 && i < optionCount)) return "Choose the correct letter.";
  }
  return null;
}

export function answerSummary(t: QuestionType, value: unknown, blocks: Block[]): string {
  const v = asAns(value);
  if (CHOICE_TYPES.includes(t)) {
    const opts = (v.options as string[]) ?? [];
    const idx = (v.correctOptionIndexes as number[]) ?? [];
    if (!idx.length) return "No correct option set";
    return idx.map((i) => `${optionLetter(i)}. ${opts[i] ?? "?"}`).join("; ");
  }
  if (t in TERNARY_VALUES) return String(v.correctValue ?? "").replace(/_/g, " ") || "Not set";
  if (SHARED_OPTION_TYPES.includes(t)) {
    const i = Number(v.correctOptionIndex);
    const opts = firstOptionsBlock(blocks)?.options ?? [];
    if (!(i >= 0)) return "No letter chosen";
    return opts[i] ? `${optionLetter(i)}. ${opts[i]}` : `${optionLetter(i)} (option missing)`;
  }
  const a = (v.acceptableAnswers as string[]) ?? [];
  return a.length ? a.join(" / ") : "No answer set";
}

/** Question numbers anchored with [[n]] across blocks. */
export function anchoredNumbers(blocks: Block[]): Set<number> {
  const out = new Set<number>();
  const scan = (s: string) => {
    for (const m of s.matchAll(/\[\[(\d+)\]\]/g)) out.add(Number(m[1]));
  };
  for (const b of blocks) {
    if (b.type === "text") scan(b.text);
    if (b.type === "table") {
      b.headers.forEach(scan);
      b.rows.forEach((r) => r.forEach(scan));
    }
  }
  return out;
}

export function nextFreeAnchor(blocks: Block[], questionCount: number): number {
  const used = anchoredNumbers(blocks);
  for (let n = 1; n <= Math.max(questionCount, 1); n++) if (!used.has(n)) return n;
  return questionCount + 1;
}

export function newId() {
  try {
    return crypto.randomUUID();
  } catch {
    return `b${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  }
}

/** Strips preview-only fields so blocks match the API schema. */
export function stripBlocks(blocks: Block[]): Block[] {
  return blocks.map((b) => {
    const { url: _url, ...rest } = b as Block & { url?: string };
    void _url;
    return rest as Block;
  });
}

/* ---------- table paste / import ---------- */

/** Parses TSV or CSV (with quotes) into a rectangular string grid. */
export function parseGrid(text: string): string[][] {
  const clean = text.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
  if (!clean) return [];
  const delim = clean.includes("\t") ? "\t" : ",";
  const rows: string[][] = [];
  let row: string[] = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < clean.length; i++) {
    const ch = clean[i]!;
    if (quoted) {
      if (ch === '"') {
        if (clean[i + 1] === '"') {
          cell += '"';
          i++;
        } else quoted = false;
      } else cell += ch;
    } else if (ch === '"' && cell === "") quoted = true;
    else if (ch === delim) {
      row.push(cell);
      cell = "";
    } else if (ch === "\n") {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = "";
    } else cell += ch;
  }
  row.push(cell);
  rows.push(row);
  const width = Math.max(...rows.map((r) => r.length));
  return rows.map((r) => [...r, ...Array(width - r.length).fill("")].map((c) => c.trim()));
}

/* ---------- bulk add ---------- */

export type BulkRow = {
  line: number;
  text: string;
  answer: unknown;
  error: string | null;
};

const TERNARY_ALIAS: Record<string, string> = {
  T: "TRUE", TRUE: "TRUE", F: "FALSE", FALSE: "FALSE", NG: "NOT_GIVEN", "NOT GIVEN": "NOT_GIVEN", NOT_GIVEN: "NOT_GIVEN",
  Y: "YES", YES: "YES", N: "NO", NO: "NO",
};

export function bulkFormatHint(t: QuestionType): string {
  if (FILL_BLANK_TYPES.includes(t)) return "question | answer1 / answer2";
  if (t in TERNARY_VALUES) return "statement | " + (t === "TRUE_FALSE_NOT_GIVEN" ? "TRUE (or T, F, NG)" : "YES (or Y, N, NG)");
  if (SHARED_OPTION_TYPES.includes(t)) return "question | C   (letter from the Options block)";
  return "question | option 1 / option 2 / option 3 | 2   (correct number or letter, several: 1,3)";
}

export function parseBulk(t: QuestionType, input: string, optionCount: number): BulkRow[] {
  const rows: BulkRow[] = [];
  input.split(/\n/).forEach((raw, idx) => {
    const line = raw.trim();
    if (!line) return;
    const parts = line.split("|").map((p) => p.trim());
    const text = parts[0] ?? "";
    let answer: unknown = null;
    let error: string | null = null;
    const second = parts[1] ?? "";
    if (!text) error = "Missing question text";
    else if (FILL_BLANK_TYPES.includes(t)) {
      const accepted = second.split("/").map((a) => a.trim()).filter(Boolean);
      answer = { acceptableAnswers: accepted };
      if (!accepted.length) error = "Missing answer after |";
    } else if (t in TERNARY_VALUES) {
      const val = TERNARY_ALIAS[second.toUpperCase()];
      if (!val || !TERNARY_VALUES[t]!.includes(val)) error = "Answer must be one of " + TERNARY_VALUES[t]!.join(", ");
      else answer = { correctValue: val };
    } else if (SHARED_OPTION_TYPES.includes(t)) {
      const i = /^\d+$/.test(second) ? Number(second) - 1 : second.toUpperCase().charCodeAt(0) - 65;
      if (second.length < 1 || !(i >= 0 && i < optionCount)) error = `Pick a letter A-${optionLetter(Math.max(optionCount - 1, 0))}`;
      else answer = { correctOptionIndex: i };
    } else {
      const options = second.split("/").map((a) => a.trim()).filter(Boolean);
      const corr = (parts[2] ?? "")
        .split(",")
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => (/^\d+$/.test(c) ? Number(c) - 1 : c.toUpperCase().charCodeAt(0) - 65));
      if (options.length < 2) error = "Need at least two options";
      else if (!corr.length || corr.some((c) => !(c >= 0 && c < options.length))) error = "Missing or invalid correct option";
      else answer = { options, correctOptionIndexes: corr };
    }
    rows.push({ line: idx + 1, text, answer, error });
  });
  return rows;
}
