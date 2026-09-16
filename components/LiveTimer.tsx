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
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    if (finishedAtIso || isPaused) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
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
