import { notFound, redirect } from "next/navigation";
import { getTeamState, formatDuration } from "@/lib/state";
import { SOLUTION_TEXT } from "@/lib/content";
import { labelForFactKeyword } from "@/lib/node-content/accusation";
import { prisma } from "@/lib/db";

function PartStamp({ ok, label }: { ok: boolean; label: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="text-ink/60">{label}</span>
      <span
        className={
          "ink-stamp font-chrome text-[10px] uppercase px-2 py-0.5 rounded-sm " +
          (ok ? "text-teal" : "text-oxblood")
        }
      >
        {ok ? "Matched" : "Missed"}
      </span>
    </div>
  );
}

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

  const factLabel =
    labelForFactKeyword(accusation.factKeywordSubmitted) ?? accusation.factKeywordSubmitted;

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

      <div className="paper-card rounded-sm p-6 flex flex-col gap-3">
        <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50">
          Your Accusation
        </p>
        <PartStamp ok={accusation.suspectCorrect} label="Suspect" />
        <PartStamp ok={accusation.methodCorrect} label="Method / weapon" />
        <PartStamp ok={accusation.factCorrect} label="Case File fact" />
        <dl className="grid grid-cols-1 gap-y-2 text-sm mt-2 border-t border-ink/10 pt-3">
          <div className="flex justify-between gap-3">
            <dt className="text-ink/60 shrink-0">Accused</dt>
            <dd className="text-right font-semibold">{accusation.suspect.name}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-ink/60 shrink-0">Method</dt>
            <dd className="text-right font-semibold">{accusation.methodSubmitted}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-ink/60">Case File fact cited</dt>
            <dd className="text-sm leading-snug">{factLabel}</dd>
          </div>
        </dl>
      </div>

      <div className="paper-card rounded-sm p-6">
        <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50 mb-3">
          {team.name}
          {team.name.endsWith("s") ? "’" : "’s"} Record
        </p>
        <dl className="grid grid-cols-2 gap-y-3 text-sm">
          <dt className="text-ink/60">Verdict accuracy</dt>
          <dd className="text-right font-semibold">
            {correctVerdicts}/{totalVerdicts} correct
          </dd>
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
