"use client";

import { useCallback, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";
import { ExamTopBar } from "@/components/exam/ExamTopBar";
import { AnswerField, InlineBlankInput, INLINE_CAPABLE_TYPES } from "@/components/exam/AnswerField";
import { BlocksRenderer, DefaultBlank } from "@/components/questions/BlocksRenderer";
import { SectionNav } from "@/components/exam/SectionNav";
import type { StudentFacingQuestion, WorkspaceGroup } from "@/lib/types/exam";
import { cn } from "@/lib/utils";

export type { WorkspaceGroup };

export function ReadingListeningWorkspace({
  attemptId,
  mockTestTitle,
  sectionLabel,
  deadlineIso,
  isLastSection,
  groups,
  initialResponses,
}: {
  attemptId: string;
  mockTestTitle: string;
  sectionLabel: "LISTENING" | "READING";
  deadlineIso?: string;
  isLastSection: boolean;
  groups: WorkspaceGroup[];
  initialResponses: Record<string, unknown>;
}) {
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);
  const [splitPercent, setSplitPercent] = useState(50);
  const [audioMuted, setAudioMuted] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [answered, setAnswered] = useState<Record<string, boolean>>({});
  const [pendingSaves, setPendingSaves] = useState<Record<string, boolean>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const questionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const audioRef = useRef<HTMLAudioElement>(null);
  const dragging = useRef(false);

  const activeGroup = groups[activeGroupIndex];
  const allQuestions = groups.flatMap((g) => g.questions);
  const hasPendingSaves = Object.values(pendingSaves).some(Boolean);

  const handleAnswered = useCallback((questionId: string, isAnswered: boolean) => {
    setAnswered((prev) => (prev[questionId] === isAnswered ? prev : { ...prev, [questionId]: isAnswered }));
  }, []);

  // Tracks every question with a save still in flight, so Next/Submit can
  // be held until each one settles — see the comment in useAutosave.
  const handlePendingChange = useCallback((questionId: string, pending: boolean) => {
    setPendingSaves((prev) => {
      if (pending) return prev[questionId] ? prev : { ...prev, [questionId]: true };
      if (!prev[questionId]) return prev;
      const next = { ...prev };
      delete next[questionId];
      return next;
    });
  }, []);

  function startDrag() {
    dragging.current = true;
    document.body.style.cursor = "col-resize";
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragging.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const pct = ((e.clientX - rect.left) / rect.width) * 100;
    setSplitPercent(Math.min(75, Math.max(25, pct)));
  }

  function stopDrag() {
    dragging.current = false;
    document.body.style.cursor = "";
  }

  function jumpToQuestion(questionId: string, groupIndex: number) {
    if (groupIndex !== activeGroupIndex) {
      setActiveGroupIndex(groupIndex);
      // Wait for the new group's questions to mount before scrolling.
      requestAnimationFrame(() => {
        questionRefs.current[questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    } else {
      questionRefs.current[questionId]?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }

  // Questions rendered inline at a [[n]] anchor in the group's blocks (n = orderIndex+1
  // within the group); they are not repeated in the question list.
  const questionsByNumber = new Map<number, StudentFacingQuestion>();
  const anchored = new Set<string>();
  if (activeGroup) {
    activeGroup.questions.forEach((q, i) => {
      const n = q.orderIndex + 1;
      questionsByNumber.set(questionsByNumber.has(n) ? i + 1 : n, q);
    });
    const text = activeGroup.blocks
      .flatMap((b) => (b.type === "text" ? [b.text] : b.type === "table" ? [...b.headers, ...b.rows.flat()] : []))
      .join("\n");
    for (const m of text.matchAll(/\[\[(\d+)\]\]/g)) {
      const q = questionsByNumber.get(Number(m[1]));
      if (q && INLINE_CAPABLE_TYPES.has(q.questionType)) anchored.add(q.id);
    }
  }
  const groupOptions = activeGroup?.blocks.find((b) => b.type === "options");
  const optionList = groupOptions && groupOptions.type === "options" ? groupOptions.options : undefined;

  function renderBlank(n: number) {
    const q = questionsByNumber.get(n);
    if (!q) return <DefaultBlank n={n} />;
    const globalNumber = allQuestions.findIndex((aq) => aq.id === q.id) + 1;
    if (!anchored.has(q.id)) return <DefaultBlank n={globalNumber} />;
    return (
      <InlineBlankInput
        attemptId={attemptId}
        question={q}
        initialResponse={initialResponses[q.id] ?? null}
        disabled={false}
        onAnswered={handleAnswered}
        onPendingChange={handlePendingChange}
        label={globalNumber}
      />
    );
  }

  if (!activeGroup) {
    return <p className="p-6 text-sm text-muted">No content configured for this section.</p>;
  }

  return (
    <div className="flex h-full flex-col" onMouseMove={onMouseMove} onMouseUp={stopDrag} onMouseLeave={stopDrag}>
      <ExamTopBar
        attemptId={attemptId}
        title={mockTestTitle}
        sectionLabel={`${sectionLabel} — Part ${activeGroup.part} of ${groups.length}`}
        deadlineIso={deadlineIso}
        isLastSection={isLastSection}
        hasAudio={!!activeGroup.audio}
        audioMuted={audioMuted}
        onToggleAudioMute={() => {
          setAudioMuted((m) => !m);
          if (audioRef.current) audioRef.current.muted = !audioMuted;
        }}
        onToggleHelp={() => setShowHelp((s) => !s)}
      />

      {/* Gray instruction banner */}
      <div className="shrink-0 border-b border-border bg-ink-soft px-5 py-3">
        <p className="text-sm font-semibold text-foreground">
          Part {activeGroup.part}
          {activeGroup.title ? ` — ${activeGroup.title}` : ""}
        </p>
        <p className="text-sm text-muted">{activeGroup.instructions}</p>
      </div>

      {showHelp && (
        <div className="shrink-0 border-b border-border bg-brand-soft px-5 py-2 text-xs text-brand">
          {groups.length} part{groups.length === 1 ? "" : "s"} in this section · {allQuestions.length}{" "}
          question{allQuestions.length === 1 ? "" : "s"} total ·{" "}
          {Object.values(answered).filter(Boolean).length} answered so far
        </div>
      )}

      {/* Resizable split */}
      <div
        ref={containerRef}
        className="flex min-h-0 flex-1 flex-col overflow-hidden md:flex-row"
        style={{ "--split": `${splitPercent}%` } as React.CSSProperties}
      >
        <div
          className={cn(
            "max-h-[40%] shrink-0 overflow-y-auto p-4 md:h-full md:max-h-none md:w-[var(--split)] md:p-6",
            !activeGroup.passage && !activeGroup.audio && "hidden md:block"
          )}
        >
          {activeGroup.passage && (
            <div className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">
              <p className="mb-3 text-base font-semibold text-foreground">{activeGroup.passage.title}</p>
              {activeGroup.passage.bodyHtml}
            </div>
          )}
          {activeGroup.audio && (
            <div className="rounded-md bg-ink-soft p-4">
              <audio ref={audioRef} controls src={`/uploads/${activeGroup.audio.storageKey}`} className="w-full" />
              <p className="mt-2 text-xs text-muted">
                The recording plays once, the way it does on exam day — there&apos;s no rewind in
                the real test either.
              </p>
            </div>
          )}
        </div>

        <div
          onMouseDown={startDrag}
          className="group relative hidden w-2 shrink-0 cursor-col-resize bg-border hover:bg-brand/40 md:block"
        >
          <span className="absolute left-1/2 top-1/2 flex h-8 w-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded border border-border bg-surface text-muted shadow-sm group-hover:text-brand">
            ⋮
          </span>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto border-t border-border p-4 md:h-full md:border-t-0 md:p-6">
          {activeGroup.blocks.length > 0 && (
            <div className="mb-6">
              <BlocksRenderer blocks={activeGroup.blocks} renderBlank={renderBlank} />
            </div>
          )}
          <div className="space-y-5">
            {activeGroup.questions.map((q, i) => {
              if (anchored.has(q.id)) return null;
              const globalIndex = allQuestions.findIndex((aq) => aq.id === q.id);
              return (
                <div
                  key={q.id}
                  ref={(el) => {
                    questionRefs.current[q.id] = el;
                  }}
                  className="space-y-2 rounded-md border border-transparent p-2 transition-colors"
                >
                  <p className="text-sm text-foreground">
                    <span className="font-mono text-muted">Q{globalIndex + 1}.</span> {q.questionText}
                  </p>
                  <AnswerField
                    attemptId={attemptId}
                    question={q}
                    initialResponse={initialResponses[q.id] ?? null}
                    disabled={false}
                    onAnswered={handleAnswered}
                    onPendingChange={handlePendingChange}
                    groupOptions={optionList}
                  />
                  {i < activeGroup.questions.length - 1 && <div className="pt-2 border-b border-border" />}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom bar: part tabs, question-number grid, nav + submit */}
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-3 border-t border-border bg-surface px-5 py-3">
        <div className="flex items-center gap-1 overflow-x-auto">
          {groups.map((g, i) => {
            const groupAnswered = g.questions.filter((q) => answered[q.id]).length;
            return (
              <button
                key={g.id}
                type="button"
                onClick={() => setActiveGroupIndex(i)}
                className={cn(
                  "shrink-0 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
                  i === activeGroupIndex
                    ? "bg-ink text-ink-foreground"
                    : "text-muted hover:bg-ink-soft hover:text-foreground"
                )}
              >
                Part {g.part} {groupAnswered}/{g.questions.length}
              </button>
            );
          })}
        </div>

        <div className="flex flex-1 items-center justify-center gap-1 overflow-x-auto">
          {allQuestions.map((q, i) => {
            const groupIndex = groups.findIndex((g) => g.questions.some((gq) => gq.id === q.id));
            const isCurrent = groupIndex === activeGroupIndex;
            return (
              <button
                key={q.id}
                type="button"
                onClick={() => jumpToQuestion(q.id, groupIndex)}
                aria-label={`Question ${i + 1}${answered[q.id] ? ", answered" : ""}`}
                className={cn(
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded text-[11px] font-mono font-medium transition-colors",
                  isCurrent && "ring-1 ring-brand/40",
                  answered[q.id]
                    ? "bg-success-soft text-success"
                    : "bg-ink-soft text-muted hover:text-foreground"
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={activeGroupIndex === 0}
            onClick={() => setActiveGroupIndex((i) => Math.max(0, i - 1))}
            aria-label="Previous part"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-ink-foreground disabled:opacity-30"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={activeGroupIndex === groups.length - 1}
            onClick={() => setActiveGroupIndex((i) => Math.min(groups.length - 1, i + 1))}
            aria-label="Next part"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-ink text-ink-foreground disabled:opacity-30"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
          <div className="ml-1">
            <SectionNav
              attemptId={attemptId}
              isLastSection={isLastSection}
              icon={<Check className="h-4 w-4" />}
              savesPending={hasPendingSaves}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
