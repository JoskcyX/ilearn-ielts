"use client";

import { useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { apiForm, ApiError } from "@/lib/api";
import type { MediaImage } from "@/lib/types/admin-content";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const ACCEPT = "image/png,image/jpeg,image/webp,image/gif";
const MAX = 8 * 1024 * 1024;

/** Drag-drop / click-to-choose uploader with title + alt text. */
export function MediaUploader({ onUploaded }: { onUploaded: (img: MediaImage) => void }) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [drag, setDrag] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function choose(f: File | undefined | null) {
    setError(null);
    if (!f) return;
    if (!ACCEPT.split(",").includes(f.type)) return setError("Use a PNG, JPEG, WebP or GIF image. SVG is not supported.");
    if (f.size > MAX) return setError("The image is larger than 8 MB.");
    setFile(f);
    setPreview((old) => {
      if (old) URL.revokeObjectURL(old);
      return URL.createObjectURL(f);
    });
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  }

  async function upload() {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      if (title.trim()) fd.append("title", title.trim());
      if (alt.trim()) fd.append("altText", alt.trim());
      const res = await apiForm<{ success: boolean; image: MediaImage }>("/api/admin/media", fd);
      onUploaded(res.image);
      setFile(null);
      setPreview(null);
      setTitle("");
      setAlt("");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          choose(e.dataTransfer.files[0]);
        }}
        className={cn(
          "flex min-h-32 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-4 text-center transition-colors",
          drag ? "border-brand bg-brand-soft" : "border-border bg-ink-soft/50"
        )}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Selected file preview" className="max-h-40 rounded-lg" />
        ) : (
          <UploadCloud className="h-7 w-7 text-muted" aria-hidden />
        )}
        <p className="text-sm text-muted">{file ? file.name : "Drop an image here, or"}</p>
        <Button type="button" variant="outline" size="sm" onClick={() => input.current?.click()}>
          {file ? "Choose a different image" : "Choose image"}
        </Button>
        <input ref={input} type="file" accept={ACCEPT} className="sr-only" aria-label="Image file" onChange={(e) => choose(e.target.files?.[0])} />
        <p className="text-xs text-muted">PNG, JPEG, WebP or GIF, up to 8 MB.</p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="mu-title">Title</Label>
          <Input id="mu-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Library floor plan" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="mu-alt">Alt text</Label>
          <Input id="mu-alt" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe the image for screen readers" />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button type="button" variant="brand" onClick={upload} disabled={!file || busy}>
          {busy ? "Uploading…" : "Upload image"}
        </Button>
        {error && (
          <span role="alert" className="text-sm text-danger">
            {error}
          </span>
        )}
      </div>
    </div>
  );
}
