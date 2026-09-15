import Link from "next/link";
import LiveTimer from "@/components/LiveTimer";

export default function TeamHeader({
  teamCode,
  teamName,
  startedAt,
  finishedAt,
  penaltySeconds,
  clearedCount,
  totalSuspects,
  active,
}: {
  teamCode: string;
  teamName: string;
  startedAt: Date;
  finishedAt: Date | null;
  penaltySeconds: number;
  clearedCount: number;
  totalSuspects: number;
  active: "midway" | "board" | "other";
}) {
  return (
    <header className="border-b border-ink/15 bg-parchment/95 backdrop-blur-sm sticky top-0 z-20">
      <div className="max-w-2xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <p className="font-display font-bold text-lg leading-none">{teamName}</p>
          <p className="font-chrome text-[11px] text-ink/50 tracking-widest">{teamCode}</p>
        </div>
        <LiveTimer
          startedAtIso={startedAt.toISOString()}
          finishedAtIso={finishedAt ? finishedAt.toISOString() : null}
          penaltySeconds={penaltySeconds}
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
