"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, Image as ImageIcon, List, Plus, Table2, Trash2, Type, X } from "lucide-react";
import type { Block } from "@/lib/validations/blocks";
import { nextFreeAnchor, newId, optionLetter } from "@/lib/question-builder";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MediaPicker, type PickedImage } from "./MediaPicker";
import { TableGridEditor } from "./TableGridEditor";

export type ImageMap = Record<string, { id: string; title: string; url: string }>;

const KIND_LABEL = { text: "Text", image: "Image", table: "Table", options: "Options list" } as const;
const KIND_ICON = { text: Type, image: ImageIcon, table: Table2, options: List } as const;

/** Add, edit, reorder and remove the content blocks shown above the questions. */
export function BlocksEditor({
  blocks,
  onChange,
  images,
  onImage,
  questionCount,
  dirty,
  saving,
  error,
  onSave,
  onDiscard,
}: {
  blocks: Block[];
  onChange: (b: Block[]) => void;
  images: ImageMap;
  onImage: (img: PickedImage) => void;
  questionCount: number;
  dirty: boolean;
  saving: boolean;
  error: string | null;
  onSave: () => void;
  onDiscard: () => void;
}) {
  const [picker, setPicker] = useState<{ replaceId: string | null } | null>(null);
  const nextBlank = nextFreeAnchor(blocks, questionCount);

  const update = (id: string, patch: Partial<Block>) => onChange(blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));
  const remove = (id: string) => onChange(blocks.filter((b) => b.id !== id));
  function move(i: number, d: -1 | 1) {
    const j = i + d;
    if (j < 0 || j >= blocks.length) return;
    const next = [...blocks];
    [next[i], next[j]] = [next[j]!, next[i]!];
    onChange(next);
  }
  function add(kind: Block["type"]) {
    const id = newId();
    if (kind === "text") onChange([...blocks, { id, type: "text", text: "" }]);
    else if (kind === "table")
      onChange([...blocks, { id, type: "table", headers: ["", "", ""], rows: [["", "", ""], ["", "", ""]] }]);
    else if (kind === "options") onChange([...blocks, { id, type: "options", title: "", options: ["", ""] }]);
    else setPicker({ replaceId: null });
  }
  function picked(img: PickedImage) {
    onImage(img);
    if (picker?.replaceId) update(picker.replaceId, { imageId: img.id } as Partial<Block>);
    else onChange([...blocks, { id: newId(), type: "image", imageId: img.id }]);
  }

  return (
    <div className="space-y-4">
      {blocks.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border px-4 py-6 text-center text-sm text-muted">
          No content yet. Add a diagram, a table, notes with blanks, or a lettered options list that questions can share.
        </p>
      ) : (
        <ol className="space-y-3">
          {blocks.map((b, i) => {
            const Icon = KIND_ICON[b.type];
            return (
              <li key={b.id} className="rounded-xl border border-border bg-surface">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  <Icon className="h-4 w-4 text-brand" aria-hidden />
                  <h4 className="text-sm font-semibold">{KIND_LABEL[b.type]}</h4>
                  <span className="text-xs text-muted">block {i + 1}</span>
                  <div className="ml-auto flex items-center">
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, -1)} disabled={i === 0} aria-label={`Move ${KIND_LABEL[b.type]} block ${i + 1} up`}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8" onClick={() => move(i, 1)} disabled={i === blocks.length - 1} aria-label={`Move ${KIND_LABEL[b.type]} block ${i + 1} down`}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="ghost" size="icon" className="h-8 w-8 text-danger hover:bg-danger-soft" onClick={() => remove(b.id)} aria-label={`Remove ${KIND_LABEL[b.type]} block ${i + 1}`}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="p-3">
                  {b.type === "text" && <TextBlock id={b.id} text={b.text} onChange={(text) => update(b.id, { text })} nextBlank={nextBlank} />}
                  {b.type === "image" && (
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="flex h-24 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-ink-soft">
                          {images[b.imageId] ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={images[b.imageId]!.url} alt={images[b.imageId]!.title} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <span className="px-2 text-center text-xs text-danger">Image missing</span>
                          )}
                        </div>
                        <div className="min-w-0 space-y-2">
                          <p className="truncate text-sm font-medium">{images[b.imageId]?.title ?? "Unknown image"}</p>
                          <Button type="button" variant="outline" size="sm" onClick={() => setPicker({ replaceId: b.id })}>
                            Change image
                          </Button>
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label htmlFor={`cap-${b.id}`}>Caption (optional)</Label>
                        <Input id={`cap-${b.id}`} value={b.caption ?? ""} maxLength={300} onChange={(e) => update(b.id, { caption: e.target.value || undefined } as Partial<Block>)} />
                      </div>
                    </div>
                  )}
                  {b.type === "table" && (
                    <div className="space-y-3">
                      <div className="space-y-1.5">
                        <Label htmlFor={`cap-${b.id}`}>Caption (optional)</Label>
                        <Input id={`cap-${b.id}`} value={b.caption ?? ""} maxLength={300} onChange={(e) => update(b.id, { caption: e.target.value || undefined } as Partial<Block>)} />
                      </div>
                      <TableGridEditor idPrefix={b.id} headers={b.headers} rows={b.rows} nextBlank={nextBlank} onChange={(t) => update(b.id, t as Partial<Block>)} />
                    </div>
                  )}
                  {b.type === "options" && <OptionsBlock block={b} onChange={(patch) => update(b.id, patch)} />}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Add a content block">
        {(["text", "image", "table", "options"] as const).map((k) => {
          const Icon = KIND_ICON[k];
          return (
            <Button key={k} type="button" variant="outline" size="sm" onClick={() => add(k)} disabled={blocks.length >= 30}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              <Icon className="h-3.5 w-3.5" aria-hidden />
              {KIND_LABEL[k]}
            </Button>
          );
        })}
      </div>

      <div className="sticky bottom-0 z-10 -mx-1 flex flex-wrap items-center gap-3 rounded-xl border border-border bg-surface/95 px-3 py-2.5 backdrop-blur">
        <Button type="button" variant="brand" onClick={onSave} disabled={!dirty || saving}>
          {saving ? "Saving…" : "Save content"}
        </Button>
        {dirty && (
          <Button type="button" variant="ghost" onClick={onDiscard} disabled={saving}>
            Discard changes
          </Button>
        )}
        <span aria-live="polite" className="text-sm">
          {dirty ? <Badge variant="warning">Unsaved changes</Badge> : <span className="text-muted">All changes saved</span>}
        </span>
        {error && (
          <span role="alert" className="text-sm text-danger">
            {error}
          </span>
        )}
      </div>

      <MediaPicker open={!!picker} onOpenChange={(o) => !o && setPicker(null)} onPick={picked} />
    </div>
  );
}

function TextBlock({ id, text, onChange, nextBlank }: { id: string; text: string; onChange: (t: string) => void; nextBlank: number }) {
  const ref = useRef<HTMLTextAreaElement>(null);
  const [n, setN] = useState<number | "">("");
  const num = n === "" ? nextBlank : n;

  function insert() {
    const el = ref.current;
    const token = `[[${num}]]`;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    onChange(text.slice(0, start) + token + text.slice(end));
    setN("");
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={`text-${id}`} className="sr-only">Text</Label>
      <Textarea id={`text-${id}`} ref={ref} className="min-h-32 leading-6" value={text} onChange={(e) => onChange(e.target.value)} placeholder="Notes, a summary or any text students read. Leave a blank line between paragraphs." />
      <div className="flex flex-wrap items-center gap-2">
        <Label htmlFor={`blank-${id}`} className="text-sm">Insert blank for question #</Label>
        <Input id={`blank-${id}`} type="number" min={1} max={999} className="h-9 w-20" value={n} placeholder={String(nextBlank)} onChange={(e) => setN(e.target.value ? Number(e.target.value) : "")} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); insert(); } }} />
        <Button type="button" size="sm" variant="outline" onClick={insert}>
          Insert [[{num}]]
        </Button>
      </div>
    </div>
  );
}

function OptionsBlock({ block, onChange }: { block: Extract<Block, { type: "options" }>; onChange: (p: Partial<Block>) => void }) {
  const set = (options: string[]) => onChange({ options } as Partial<Block>);
  return (
    <div className="space-y-3">
      <p className="text-xs text-muted">One shared list with letters. Matching and map questions pick their answer from it.</p>
      <div className="space-y-1.5">
        <Label htmlFor={`ot-${block.id}`}>List title (optional)</Label>
        <Input id={`ot-${block.id}`} value={block.title ?? ""} maxLength={200} placeholder="e.g. List of facilities" onChange={(e) => onChange({ title: e.target.value || undefined } as Partial<Block>)} />
      </div>
      <ul className="space-y-2">
        {block.options.map((o, i) => (
          <li key={i} className="flex items-center gap-2">
            <span aria-hidden className="w-5 text-sm font-bold text-brand">{optionLetter(i)}</span>
            <Input
              id={`opt-${block.id}-${i}`}
              value={o}
              aria-label={`Option ${optionLetter(i)}`}
              onChange={(e) => set(block.options.map((x, k) => (k === i ? e.target.value : x)))}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (block.options.length < 26) {
                    set([...block.options.slice(0, i + 1), "", ...block.options.slice(i + 1)]);
                    setTimeout(() => document.getElementById(`opt-${block.id}-${i + 1}`)?.focus(), 0);
                  }
                }
              }}
            />
            <Button type="button" variant="ghost" size="icon" className="h-9 w-9 shrink-0" disabled={block.options.length <= 2} onClick={() => set(block.options.filter((_, k) => k !== i))} aria-label={`Remove option ${optionLetter(i)}`}>
              <X className="h-4 w-4" />
            </Button>
          </li>
        ))}
      </ul>
      <Button type="button" variant="outline" size="sm" disabled={block.options.length >= 26} onClick={() => set([...block.options, ""])}>
        <Plus className="h-3.5 w-3.5" aria-hidden /> Add option
      </Button>
    </div>
  );
}
