"use client";

import { useEffect, useState } from "react";
import { Minus, Plus, X, ZoomIn } from "lucide-react";

/** Image that opens in a simple zoomable lightbox on click (diagrams can be detailed). */
export function ZoomableImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  function show() {
    setZoom(1);
    setOpen(true);
  }

  return (
    <>
      <button
        type="button"
        onClick={show}
        className="group relative mx-auto block cursor-zoom-in"
        aria-label={`Enlarge image: ${alt}`}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={alt} className="mx-auto max-h-[28rem] w-auto max-w-full" />
        <span className="absolute right-2 top-2 rounded-md bg-black/60 p-1 text-white opacity-80 group-hover:opacity-100">
          <ZoomIn className="h-4 w-4" />
        </span>
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={alt}
          className="fixed inset-0 z-50 flex flex-col bg-black/85"
          onClick={() => setOpen(false)}
        >
          <div className="flex shrink-0 items-center justify-end gap-2 p-3" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              aria-label="Zoom out"
              disabled={zoom <= 1}
              onClick={() => setZoom((z) => Math.max(1, z - 0.5))}
              className="rounded-md bg-white/15 p-2 text-white disabled:opacity-40"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-12 text-center text-xs text-white">{Math.round(zoom * 100)}%</span>
            <button
              type="button"
              aria-label="Zoom in"
              disabled={zoom >= 4}
              onClick={() => setZoom((z) => Math.min(4, z + 0.5))}
              className="rounded-md bg-white/15 p-2 text-white disabled:opacity-40"
            >
              <Plus className="h-4 w-4" />
            </button>
            <button type="button" aria-label="Close" onClick={() => setOpen(false)} className="rounded-md bg-white/15 p-2 text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-auto p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              onClick={(e) => e.stopPropagation()}
              style={{ width: `${zoom * 100}%`, maxWidth: zoom === 1 ? "100%" : "none" }}
              className="mx-auto block h-auto max-h-none rounded bg-white"
            />
          </div>
        </div>
      )}
    </>
  );
}
