"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Upload } from "lucide-react";
import { call } from "@/lib/api";
import type { MediaImage } from "@/lib/types/admin-content";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { ConfirmDialog, Modal } from "./Modal";
import { MediaUploader } from "./MediaUploader";

function kb(n: number) {
  return n >= 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;
}

export function MediaLibrary({ initialImages }: { initialImages: MediaImage[] }) {
  const router = useRouter();
  const [images, setImages] = useState(initialImages);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [toDelete, setToDelete] = useState<MediaImage | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!toDelete) return;
    setPending(true);
    setError(null);
    const r = await call(`/api/admin/media/${toDelete.id}`, { method: "DELETE" });
    setPending(false);
    if (!r.success) return setError(r.error);
    setImages((list) => list.filter((i) => i.id !== toDelete.id));
    setToDelete(null);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted" aria-live="polite">
          {images.length} {images.length === 1 ? "image" : "images"}
        </p>
        <Button variant="brand" onClick={() => setUploadOpen(true)}>
          <Upload className="h-4 w-4" aria-hidden /> Upload image
        </Button>
      </div>

      {images.length === 0 ? (
        <EmptyState
          title="No images yet"
          description="Upload a diagram, map or flow chart to use it in a question group."
          action={<Button variant="brand" onClick={() => setUploadOpen(true)}>Upload image</Button>}
        />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {images.map((img) => (
            <li key={img.id}>
              <Card className="flex h-full flex-col overflow-hidden">
                <div className="flex aspect-[4/3] items-center justify-center bg-ink-soft">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img.url} alt={img.altText ?? img.title} loading="lazy" className="max-h-full max-w-full object-contain" />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-3">
                  <p className="truncate text-sm font-semibold" title={img.title}>{img.title}</p>
                  <p className="line-clamp-2 min-h-8 text-xs text-muted">{img.altText || "No alt text"}</p>
                  <div className="mt-auto flex items-center justify-between gap-2 pt-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <Badge variant={img.usedBy > 0 ? "default" : "neutral"}>
                        {img.usedBy > 0 ? `Used in ${img.usedBy} ${img.usedBy === 1 ? "group" : "groups"}` : "Not used"}
                      </Badge>
                      <span className="text-xs text-muted">{kb(img.sizeBytes)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-danger hover:bg-danger-soft"
                      aria-label={`Delete ${img.title}`}
                      onClick={() => {
                        setError(null);
                        setToDelete(img);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          ))}
        </ul>
      )}

      <Modal open={uploadOpen} onOpenChange={setUploadOpen} title="Upload image" description="Add a title and alt text so the image is easy to find and accessible.">
        <MediaUploader
          onUploaded={(img) => {
            setImages((list) => [img, ...list]);
            setUploadOpen(false);
            router.refresh();
          }}
        />
      </Modal>

      <ConfirmDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
        title="Delete this image?"
        description={`"${toDelete?.title ?? ""}" will be removed from the library. This cannot be undone.`}
        confirmLabel="Delete image"
        onConfirm={remove}
        pending={pending}
        error={error}
      />
    </div>
  );
}
