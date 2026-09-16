import Link from "next/link";
import LiveTimer from "@/components/LiveTimer";

export default function TeamHeader({
  teamCode,
  teamName,
  startedAt,
  finishedAt,
  penaltySeconds,
  pausedSeconds = 0,
  isPaused = false,
  broadcastMessage = null,
  organiserHint = null,
  clearedCount,
  totalSuspects,
  active,
}: {
  teamCode: string;
  teamName: string;
  startedAt: Date;
  finishedAt: Date | null;
  penaltySeconds: number;
  pausedSeconds?: number;
  isPaused?: boolean;
  broadcastMessage?: string | null;
  organiserHint?: string | null;
  clearedCount: number;
  totalSuspects: number;
  active: "midway" | "board" | "other";
}) {
  return (
    <header className="border-b border-ink/15 bg-parchment/95 backdrop-blur-sm sticky top-0 z-20">
      {broadcastMessage && (
        <div className="bg-oxblood text-parchment text-center text-sm px-4 py-2 font-chrome">
          {broadcastMessage}
        </div>
      )}
      {organiserHint && (
        <div className="bg-gold/20 border-b border-gold/40 text-center text-sm px-4 py-2">
          Organiser note: {organiserHint}
        </div>
      )}
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-display font-bold text-lg leading-none">{teamName}</p>
          <p className="font-chrome text-[11px] text-ink/50 tracking-widest">{teamCode}</p>
        </div>
        <LiveTimer
          startedAtIso={startedAt.toISOString()}
          finishedAtIso={finishedAt ? finishedAt.toISOString() : null}
          penaltySeconds={penaltySeconds}
          pausedSeconds={pausedSeconds}
          isPaused={isPaused}
        />
      </div>
      <nav className="max-w-2xl mx-auto px-4 pb-2 flex gap-4 text-sm font-chrome uppercase tracking-wide">
        <Link
          href={`/team/${teamCode}`}
          className={active === "midway" ? "text-oxblood border-b-2 border-oxblood pb-1" : "text-ink/60 pb-1"}
        >
          Midway
        </Link>
        <Link
          href={`/team/${teamCode}/board`}
          className={active === "board" ? "text-oxblood border-b-2 border-oxblood pb-1" : "text-ink/60 pb-1"}
        >
          Deduction Board · {clearedCount}/{totalSuspects}
        </Link>
      </nav>
    </header>
  );
}
