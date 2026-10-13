"use client";

import { useState } from "react";
import { Maximize, Minimize, Volume2, VolumeX, Menu } from "lucide-react";
import { AttemptTimer } from "@/components/exam/AttemptTimer";

export function ExamTopBar({
  attemptId,
  title,
  sectionLabel,
  deadlineIso,
  isLastSection,
  hasAudio,
  audioMuted,
  onToggleAudioMute,
  onToggleHelp,
}: {
  attemptId: string;
  title: string;
  sectionLabel: string;
  deadlineIso?: string;
  isLastSection: boolean;
  hasAudio?: boolean;
  audioMuted?: boolean;
  onToggleAudioMute?: () => void;
  onToggleHelp?: () => void;
}) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen?.();
      setIsFullscreen(false);
    }
  }

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-surface px-5">
      <div className="flex items-center gap-3">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-ink text-sm font-semibold text-ink-foreground">
          I
        </span>
        <div>
          <p className="text-sm font-semibold leading-tight text-foreground">{title}</p>
          <p className="text-xs leading-tight text-muted">{sectionLabel}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {deadlineIso && (
          <AttemptTimer attemptId={attemptId} deadlineIso={deadlineIso} isLastSection={isLastSection} />
        )}
        <div className="ml-1 flex items-center gap-1 text-muted">
          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ink-soft hover:text-foreground"
          >
            {isFullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
          {hasAudio && (
            <button
              type="button"
              onClick={onToggleAudioMute}
              aria-label={audioMuted ? "Unmute audio" : "Mute audio"}
              className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ink-soft hover:text-foreground"
            >
              {audioMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </button>
          )}
          <button
            type="button"
            onClick={onToggleHelp}
            aria-label="Show section overview"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-ink-soft hover:text-foreground"
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
