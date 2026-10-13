"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, CheckCircle2, Copy, Trash2, XCircle } from "lucide-react";
import { call } from "@/lib/api";
import type { GroupReadiness, QuestionGroupDetail, SectionName, TestType } from "@/lib/types/admin-content";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ContentStatusControl } from "@/components/admin/questions/ContentStatusControl";
import { ConfirmDialog, selectClass } from "./Modal";

type Option = { id: string; title: string };

export function GroupSettings({
  group,
  passages,
  audioAssets,
  readiness,
}: {
  group: QuestionGroupDetail;
  passages: Option[];
  audioAssets: Option[];
  readiness: GroupReadiness;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(group.title ?? "");
  const [section, setSection] = useState<SectionName>(group.section);
  const [testType, setTestType] = useState<TestType>(group.testType);
  const [part, setPart] = useState(group.part);
  const [instructions, setInstructions] = useState(group.instructions);
  const [passageId, setPassageId] = useState(group.passageId ?? "");
  const [audioId, setAudioId] = useState(group.audioId ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [delOpen, setDelOpen] = useState(false);
  const [delError, setDelError] = useState<string | null>(null);
  const [delBusy, setDelBusy] = useState(false);

  const dirty =
    title !== (group.title ?? "") || section !== group.section || testType !== group.testType || part !== group.part ||
    instructions !== group.instructions || passageId !== (group.passageId ?? "") || audioId !== (group.audioId ?? "");

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const r = await call(`/api/admin/question-groups/${group.id}`, {
      method: "PUT",
      body: {
        title: title.trim() || null,
        section,
        testType,
        part,
        instructions: instructions.trim(),
        passageId: section === "READING" ? passageId || null : null,
        audioId: section === "LISTENING" ? audioId || null : null,
      },
    });
    setBusy(false);
    if (!r.success) return setMsg({ ok: false, text: r.error });
    setMsg({ ok: true, text: "Settings saved." });
    router.refresh();
  }

  async function duplicate() {
    setMsg(null);
    const r = await call<{ id: string }>(`/api/admin/question-groups/${group.id}/duplicate`, { method: "POST", body: {} });
    if (!r.success) return setMsg({ ok: false, text: r.error });
    router.push(`/admin/question-groups/${r.id}`);
  }

  async function remove() {
    setDelBusy(true);
    setDelError(null);
    const r = await call(`/api/admin/question-groups/${group.id}`, { method: "DELETE" });
    setDelBusy(false);
    if (!r.success) return setDelError(r.error);
    router.push("/admin/question-groups");
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <ContentStatusControl id={group.id} status={group.status} endpoint="/api/admin/question-groups" />
        <div className="flex gap-2">
          <Button type="button" variant="outline" size="sm" onClick={duplicate}>
            <Copy className="h-3.5 w-3.5" aria-hidden /> Duplicate
          </Button>
          <Button type="button" variant="outline" size="sm" className="text-danger" onClick={() => { setDelError(null); setDelOpen(true); }}>
            <Trash2 className="h-3.5 w-3.5" aria-hidden /> Delete
          </Button>
        </div>
      </div>

      <Readiness r={readiness} />

      <form onSubmit={save} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="gs-title">Title</Label>
          <Input id="gs-title" value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Reading Part 1, Questions 1-7" />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1.5">
            <Label htmlFor="gs-section">Section</Label>
            <select id="gs-section" className={selectClass} value={section} onChange={(e) => setSection(e.target.value as SectionName)}>
              <option value="READING">Reading</option>
              <option value="LISTENING">Listening</option>
              <option value="WRITING">Writing</option>
              <option value="SPEAKING">Speaking</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gs-type">Test type</Label>
            <select id="gs-type" className={selectClass} value={testType} onChange={(e) => setTestType(e.target.value as TestType)}>
              <option value="ACADEMIC">Academic</option>
              <option value="GENERAL_TRAINING">General Training</option>
            </select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="gs-part">Part</Label>
            <select id="gs-part" className={selectClass} value={part} onChange={(e) => setPart(Number(e.target.value))}>
              {[1, 2, 3, 4].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </div>
        </div>
        {section === "READING" && (
          <div className="space-y-1.5">
            <Label htmlFor="gs-passage">Passage</Label>
            <select id="gs-passage" className={selectClass} value={passageId} onChange={(e) => setPassageId(e.target.value)}>
              <option value="">Select a passage…</option>
              {passages.map((p) => (
                <option key={p.id} value={p.id}>{p.title}</option>
              ))}
            </select>
          </div>
        )}
        {section === "LISTENING" && (
          <div className="space-y-1.5">
            <Label htmlFor="gs-audio">Audio</Label>
            <select id="gs-audio" className={selectClass} value={audioId} onChange={(e) => setAudioId(e.target.value)}>
              <option value="">Select an audio clip…</option>
              {audioAssets.map((a) => (
                <option key={a.id} value={a.id}>{a.title}</option>
              ))}
            </select>
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="gs-instr">Instructions for students</Label>
          <Textarea id="gs-instr" rows={3} value={instructions} onChange={(e) => setInstructions(e.target.value)} />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" variant="brand" disabled={busy || !dirty || !instructions.trim()}>
            {busy ? "Saving…" : "Save settings"}
          </Button>
          {dirty && <Badge variant="warning">Unsaved changes</Badge>}
          {msg && (
            <span role={msg.ok ? "status" : "alert"} className={msg.ok ? "text-sm text-success" : "text-sm text-danger"}>
              {msg.text}
            </span>
          )}
        </div>
      </form>

      <ConfirmDialog
        open={delOpen}
        onOpenChange={setDelOpen}
        title="Delete this question group?"
        description="The group and all of its questions are removed. This cannot be undone."
        confirmLabel="Delete group"
        onConfirm={remove}
        pending={delBusy}
        error={delError}
      />
    </div>
  );
}

function Readiness({ r }: { r: GroupReadiness }) {
  return (
    <section aria-labelledby="ready-h" className="rounded-xl border border-border bg-ink-soft/40 p-3">
      <div className="flex items-center gap-2">
        <h3 id="ready-h" className="text-sm font-semibold">Ready to publish?</h3>
        <Badge variant={r.ready ? "success" : "warning"}>{r.ready ? "Ready" : `${r.issues.length} to fix`}</Badge>
      </div>
      {r.issues.length === 0 && r.warnings.length === 0 ? (
        <p className="mt-2 flex items-center gap-2 text-sm text-success">
          <CheckCircle2 className="h-4 w-4" aria-hidden /> Nothing left to fix.
        </p>
      ) : (
        <ul className="mt-2 space-y-1.5 text-sm">
          {r.issues.map((t, i) => (
            <li key={`i${i}`} className="flex gap-2 text-danger">
              <XCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span><span className="sr-only">Problem: </span>{t}</span>
            </li>
          ))}
          {r.warnings.map((t, i) => (
            <li key={`w${i}`} className="flex gap-2 text-warning">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden /> <span><span className="sr-only">Warning: </span>{t}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
