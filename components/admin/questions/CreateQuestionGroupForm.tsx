"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { selectClass } from "@/components/admin/builder/Modal";
import type { SectionName, TestType } from "@/lib/types/admin-content";

type Option = { id: string; title: string };

const SECTIONS: { value: SectionName; label: string }[] = [
  { value: "READING", label: "Reading" },
  { value: "LISTENING", label: "Listening" },
  { value: "WRITING", label: "Writing" },
  { value: "SPEAKING", label: "Speaking" },
];

/** Creates an empty group, then opens it in the builder to add content and questions. */
export function CreateQuestionGroupForm({
  passages,
  audioAssets,
  onCancel,
}: {
  passages: Option[];
  audioAssets: Option[];
  onCancel?: () => void;
}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [section, setSection] = useState<SectionName>("READING");
  const [testType, setTestType] = useState<TestType>("ACADEMIC");
  const [part, setPart] = useState(1);
  const [instructions, setInstructions] = useState("");
  const [passageId, setPassageId] = useState("");
  const [audioId, setAudioId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await call<{ id: string }>("/api/admin/question-groups", {
        body: {
          title: title.trim() || undefined,
          section,
          testType,
          part,
          instructions: instructions.trim(),
          passageId: section === "READING" ? passageId || undefined : undefined,
          audioId: section === "LISTENING" ? audioId || undefined : undefined,
        },
      });
      if (!result.success) return setError(result.error);
      router.push(`/admin/question-groups/${result.id}`);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="qgTitle">Title</Label>
        <Input id="qgTitle" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reading Part 1, Questions 1-7" maxLength={200} />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="qgSection">Section</Label>
          <select id="qgSection" value={section} onChange={(e) => setSection(e.target.value as SectionName)} className={selectClass}>
            {SECTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qgTestType">Test type</Label>
          <select id="qgTestType" value={testType} onChange={(e) => setTestType(e.target.value as TestType)} className={selectClass}>
            <option value="ACADEMIC">Academic</option>
            <option value="GENERAL_TRAINING">General Training</option>
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="qgPart">Part</Label>
          <select id="qgPart" value={part} onChange={(e) => setPart(Number(e.target.value))} className={selectClass}>
            {[1, 2, 3, 4].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
      </div>

      {section === "READING" && (
        <div className="space-y-1.5">
          <Label htmlFor="qgPassage">Passage</Label>
          <select id="qgPassage" value={passageId} onChange={(e) => setPassageId(e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            {passages.map((p) => (
              <option key={p.id} value={p.id}>{p.title}</option>
            ))}
          </select>
          {passages.length === 0 && <p className="text-xs text-muted">No passages yet. Add one on the Passages page.</p>}
        </div>
      )}
      {section === "LISTENING" && (
        <div className="space-y-1.5">
          <Label htmlFor="qgAudio">Audio</Label>
          <select id="qgAudio" value={audioId} onChange={(e) => setAudioId(e.target.value)} className={selectClass}>
            <option value="">Select…</option>
            {audioAssets.map((a) => (
              <option key={a.id} value={a.id}>{a.title}</option>
            ))}
          </select>
          {audioAssets.length === 0 && <p className="text-xs text-muted">No audio yet. Upload a clip on the Audio page.</p>}
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="qgInstructions">Instructions for students</Label>
        <Textarea id="qgInstructions" value={instructions} onChange={(e) => setInstructions(e.target.value)} rows={3} required placeholder="e.g. Choose the correct letter, A, B, C or D." />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" variant="brand" disabled={isPending || !instructions.trim() || (section === "READING" && !passageId) || (section === "LISTENING" && !audioId)}>
          {isPending ? "Creating…" : "Create and open builder"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        )}
        {error && <span role="alert" className="text-sm text-danger">{error}</span>}
      </div>
    </form>
  );
}
