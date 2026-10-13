"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Mic, Square, RotateCcw } from "lucide-react";
import { call } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Status = "idle" | "recording" | "recorded" | "uploading" | "uploaded" | "error";

function formatElapsed(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

function pickMimeType(): string {
  const candidates = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg;codecs=opus"];
  for (const c of candidates) {
    if (typeof MediaRecorder !== "undefined" && MediaRecorder.isTypeSupported?.(c)) return c;
  }
  return "";
}

/**
 * Records one Speaking cue-card part with the browser's MediaRecorder,
 * then auto-uploads on stop — same autosave-on-change philosophy as the
 * rest of the exam, just for audio instead of text. `onPendingChange`
 * plugs into the same Next/Submit guard used for Reading/Writing answers
 * (see AnswerField's useAutosave) so a student can't click past an
 * upload that's still in flight.
 *
 * getUserMedia requires a secure context (HTTPS, or http://localhost for
 * local dev/demo use) — on a real deployment this page must be served
 * over HTTPS or recording will silently fail to even prompt for the mic.
 */
const subscribeNoop = () => () => {};

export function SpeakingRecorder({
  attemptId,
  part,
  initialRecording,
  onPendingChange,
}: {
  attemptId: string;
  part: number;
  initialRecording?: { url: string } | null;
  onPendingChange?: (part: number, pending: boolean) => void;
}) {
  const [status, setStatus] = useState<Status>(initialRecording ? "uploaded" : "idle");
  const [audioUrl, setAudioUrl] = useState<string | null>(initialRecording?.url ?? null);
  const [elapsed, setElapsed] = useState(0);
  const [error, setError] = useState<string | null>(null);
  // Capability check; false on the server/first render, real value after hydration.
  const unsupported = useSyncExternalStore(
    subscribeNoop,
    () =>
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined",
    () => false
  );

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const elapsedRef = useRef(0);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  async function upload(blob: Blob, durationSec: number) {
    setStatus("uploading");
    onPendingChange?.(part, true);
    try {
      const ext = blob.type.includes("mp4") ? "mp4" : blob.type.includes("ogg") ? "ogg" : "webm";
      const formData = new FormData();
      formData.append("attemptId", attemptId);
      formData.append("part", String(part));
      formData.append("durationSec", String(durationSec));
      formData.append("file", blob, `part-${part}.${ext}`);
      const result = await call(`/api/exam/attempts/${attemptId}/speaking`, { method: "POST", form: formData });
      if (result.success) {
        setStatus("uploaded");
      } else {
        setStatus("error");
        setError(result.error);
      }
    } catch {
      setStatus("error");
      setError("Upload failed. Check your connection and try again.");
    } finally {
      onPendingChange?.(part, false);
    }
  }

  async function startRecording() {
    setError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
        const url = URL.createObjectURL(blob);
        objectUrlRef.current = url;
        setAudioUrl(url);
        setStatus("recorded");
        streamRef.current?.getTracks().forEach((t) => t.stop());
        void upload(blob, elapsedRef.current);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      setElapsed(0);
      elapsedRef.current = 0;
      timerRef.current = setInterval(() => {
        elapsedRef.current += 1;
        setElapsed(elapsedRef.current);
      }, 1000);
    } catch {
      setError("Couldn't access the microphone — check your browser's permission for this site.");
    }
  }

  function stopRecording() {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    mediaRecorderRef.current?.stop();
  }

  function reRecord() {
    setStatus("idle");
    setAudioUrl(null);
    setError(null);
    setElapsed(0);
  }

  if (unsupported) {
    return (
      <p className="rounded-md bg-warning-soft p-3 text-sm text-warning">
        Recording isn&apos;t supported in this browser. Try a recent version of Chrome, Edge,
        Firefox, or Safari.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {status === "idle" && (
        <Button type="button" onClick={startRecording} className="gap-2">
          <Mic className="h-4 w-4" /> Start recording
        </Button>
      )}

      {status === "recording" && (
        <div className="flex items-center gap-3">
          <Button type="button" variant="destructive" onClick={stopRecording} className="gap-2">
            <Square className="h-4 w-4" /> Stop
          </Button>
          <span className="font-mono text-sm text-danger">● {formatElapsed(elapsed)}</span>
        </div>
      )}

      {status !== "idle" && status !== "recording" && audioUrl && (
        <div className="space-y-2">
          <audio controls src={audioUrl} className="w-full max-w-sm" />
          <div className="flex items-center gap-3">
            <Button type="button" variant="outline" onClick={reRecord} className="gap-2 text-xs">
              <RotateCcw className="h-3.5 w-3.5" /> Re-record
            </Button>
            <span
              className={cn(
                "text-xs",
                status === "uploading" && "text-muted",
                status === "uploaded" && "text-success",
                status === "error" && "text-danger"
              )}
            >
              {status === "uploading"
                ? "Saving…"
                : status === "uploaded"
                  ? "Saved"
                  : status === "error"
                    ? "Couldn't save — try re-recording"
                    : ""}
            </span>
          </div>
        </div>
      )}

      {error && <p className="text-xs text-danger">{error}</p>}
    </div>
  );
}
