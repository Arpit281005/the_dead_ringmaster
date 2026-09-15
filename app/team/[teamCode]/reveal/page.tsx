import { notFound, redirect } from "next/navigation";
import { getTeamState, formatDuration } from "@/lib/state";
import { SOLUTION_TEXT } from "@/lib/content";
import { prisma } from "@/lib/db";

export default async function RevealPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const state = await getTeamState(teamCode);
  if (state.phase === "not-found" || !state.team) notFound();
  if (state.phase !== "finished" || !state.accusation) redirect(`/team/${teamCode}`);

  const { team, accusation } = state;
  const verdicts = await prisma.verdict.findMany({ where: { teamId: team.id } });
  const correctVerdicts = verdicts.filter((v) => v.wasCorrect).length;
  const totalVerdicts = verdicts.length;

  const elapsed = team.finishedAt
    ? Math.floor((team.finishedAt.getTime() - team.startedAt.getTime()) / 1000)
    : 0;
  const total = elapsed + team.penaltySeconds;

  return (
    <main className="flex-1 px-5 py-10 max-w-md mx-auto w-full flex flex-col gap-6">
      <div className="text-center">
        <p className="font-chrome text-xs tracking-[0.3em] text-oxblood uppercase mb-2">
          {accusation.wasCorrect ? "Case Closed" : "The Wrong Name"}
        </p>
        <h1 className="font-display text-3xl font-black">
          {accusation.wasCorrect ? "You Named the Killer" : "The Killer Walks"}
        </h1>
      </div>

      <div className="paper-card rounded-sm p-6">
        <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50 mb-2">
          The Final Chapter
        </p>
        <p className="drop-cap text-[17px] leading-relaxed">{SOLUTION_TEXT}</p>
      </div>

      <div className="paper-card rounded-sm p-6">
        <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50 mb-3">
          {team.name}
          {team.name.endsWith("s") ? "’" : "’s"} Record
        </p>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-ink/60">Accused</dt>
          <dd className="text-right font-semibold">{accusation.suspect.name}</dd>
          <dt className="text-ink/60">Verdict accuracy</dt>
          <dd className="text-right font-semibold">{correctVerdicts}/{totalVerdicts} correct</dd>
          <dt className="text-ink/60">Elapsed time</dt>
          <dd className="text-right font-semibold">{formatDuration(elapsed)}</dd>
          <dt className="text-ink/60">Penalties</dt>
          <dd className="text-right font-semibold">{formatDuration(team.penaltySeconds)}</dd>
          <dt className="text-ink/60">Final time</dt>
          <dd className="text-right font-semibold">{formatDuration(total)}</dd>
        </dl>
      </div>

      <div className="paper-card rounded-sm p-6">
        <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50 mb-2">
          Your Reasoning
        </p>
        <p className="italic">&ldquo;{accusation.reasoning}&rdquo;</p>
      </div>
    </main>
  );
}
