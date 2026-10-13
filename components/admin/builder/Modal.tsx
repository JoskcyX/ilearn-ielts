"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Accessible modal (focus trap, Esc to close) built on Radix Dialog. */
export function Modal({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-ink/50 backdrop-blur-[2px]" />
        <Dialog.Content
          className={cn(
            "fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-[calc(100vw-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 flex-col rounded-2xl border border-border bg-surface shadow-lift focus:outline-none",
            className
          )}
        >
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <Dialog.Title className="font-display text-lg font-bold">{title}</Dialog.Title>
              {description ? (
                <Dialog.Description className="mt-0.5 text-sm text-muted">{description}</Dialog.Description>
              ) : (
                <Dialog.Description className="sr-only">{title}</Dialog.Description>
              )}
            </div>
            <Dialog.Close asChild>
              <Button variant="ghost" size="icon" aria-label="Close" className="-mr-2 -mt-1 h-9 w-9">
                <X className="h-4 w-4" />
              </Button>
            </Dialog.Close>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto p-5">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  onConfirm,
  pending,
  error,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  pending?: boolean;
  error?: string | null;
}) {
  return (
    <Modal open={open} onOpenChange={onOpenChange} title={title} description={description} className="max-w-md">
      {error && (
        <p role="alert" className="mb-4 rounded-lg bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Cancel
        </Button>
        <Button variant="destructive" onClick={onConfirm} disabled={pending}>
          {pending ? "Working…" : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}

export const selectClass =
  "flex h-11 w-full rounded-xl border border-border bg-white px-3 text-sm text-foreground focus-visible:outline-none focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/30 disabled:opacity-50";
