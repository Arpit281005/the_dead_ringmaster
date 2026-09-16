"use client";

import { useEffect, useState } from "react";
import { formatDuration } from "@/lib/format";

export default function LiveTimer({
  startedAtIso,
  finishedAtIso,
  penaltySeconds,
  pausedSeconds = 0,
  isPaused = false,
}: {
  startedAtIso: string;
  finishedAtIso: string | null;
  penaltySeconds: number;
  pausedSeconds?: number;
  isPaused?: boolean;
}) {
  // null until client tick — avoids SSR/client mismatch
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval> | undefined;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;
      setNow(Date.now());
      if (finishedAtIso || isPaused) return;
      intervalId = setInterval(() => setNow(Date.now()), 1000);
    });

    return () => {
      cancelled = true;
      if (intervalId) clearInterval(intervalId);
    };
  }, [finishedAtIso, isPaused]);

  const startedAt = new Date(startedAtIso).getTime();
  const end = finishedAtIso ? new Date(finishedAtIso).getTime() : now;
  const rawElapsed = end === null ? 0 : Math.max(0, Math.floor((end - startedAt) / 1000));
  const elapsed = Math.max(0, rawElapsed - pausedSeconds);
  const total = elapsed + penaltySeconds;

  return (
    <div className="flex items-baseline gap-3 font-chrome">
      <span className="text-lg tabular-nums">{formatDuration(elapsed)}</span>
      {isPaused && <span className="text-xs text-oxblood uppercase">Paused</span>}
      {penaltySeconds > 0 && (
        <span className="text-xs text-oxblood tabular-nums">
          +{formatDuration(penaltySeconds)} penalty
        </span>
      )}
      <span className="text-xs text-ink/50 tabular-nums">total {formatDuration(total)}</span>
    </div>
  );
}
