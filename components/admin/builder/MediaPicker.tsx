"use client";

import { useEffect, useState } from "react";
import { api, ApiError } from "@/lib/api";
import type { MediaImage, MediaResponse } from "@/lib/types/admin-content";
import { Modal } from "./Modal";
import { MediaUploader } from "./MediaUploader";
import { cn } from "@/lib/utils";

export type PickedImage = { id: string; title: string; url: string };

/** Choose an image from the library or upload a new one inline. */
export function MediaPicker({
  open,
  onOpenChange,
  onPick,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onPick: (img: PickedImage) => void;
}) {
  const [tab, setTab] = useState<"library" | "upload">("library");
  const [images, setImages] = useState<MediaImage[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    api<MediaResponse>("/api/admin/media")
      .then((r) => alive && setImages(r.images))
      .catch((e) => alive && setError(e instanceof ApiError ? e.message : "Could not load the library."));
    return () => {
      alive = false;
    };
  }, [open]);

  function pick(img: MediaImage) {
    onPick({ id: img.id, title: img.title, url: img.url });
    onOpenChange(false);
  }

  return (
    <Modal open={open} onOpenChange={onOpenChange} title="Choose an image" description="Pick from your library or upload a new image." className="max-w-3xl">
      <div role="tablist" aria-label="Image source" className="mb-4 inline-flex rounded-xl bg-ink-soft p-1">
        {(["library", "upload"] as const).map((t) => (
          <button
            key={t}
            role="tab"
            type="button"
            aria-selected={tab === t}
            onClick={() => setTab(t)}
            className={cn(
              "rounded-lg px-4 py-1.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
              tab === t ? "bg-surface shadow-sm" : "text-muted hover:text-foreground"
            )}
          >
            {t === "library" ? "Library" : "Upload new"}
          </button>
        ))}
      </div>
      {tab === "upload" ? (
        <MediaUploader onUploaded={pick} />
      ) : error ? (
        <p role="alert" className="text-sm text-danger">
          {error}
        </p>
      ) : images === null ? (
        <p className="text-sm text-muted">Loading images…</p>
      ) : images.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted">
          No images yet. Use “Upload new” to add the first one.
        </p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {images.map((img) => (
            <li key={img.id}>
              <button
                type="button"
                onClick={() => pick(img)}
                className="group w-full overflow-hidden rounded-xl border border-border bg-surface text-left transition-shadow hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <div className="flex aspect-[4/3] items-center justify-center bg-ink-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText ?? img.title} loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <p className="truncate px-2.5 py-2 text-xs font-medium">{img.title}</p>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}
