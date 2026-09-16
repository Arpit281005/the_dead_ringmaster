import { notFound } from "next/navigation";
import { getTeamState, getAllSuspectsPublic } from "@/lib/state";
import { prisma } from "@/lib/db";
import TeamHeader from "@/components/TeamHeader";
import SuspectCard from "@/components/SuspectCard";

export default async function BoardPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const state = await getTeamState(teamCode);
  if (state.phase === "not-found" || !state.team) notFound();

  const { team, clearances } = state;
  const suspects = await getAllSuspectsPublic();
  const notes = await prisma.teamNote.findMany({ where: { teamId: team.id } });

  const clearanceBySuspect = new Map(clearances.map((c) => [c.suspectId, c]));
  const noteBySuspect = new Map(notes.map((n) => [n.suspectId, n.note]));

  return (
    <>
      <TeamHeader
        teamCode={team.teamCode}
        teamName={team.name}
        startedAt={team.startedAt}
        finishedAt={team.finishedAt}
        penaltySeconds={team.penaltySeconds}
        clearedCount={clearances.length}
        totalSuspects={suspects.length}
        active="board"
      />
      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-2xl font-black mb-1">The Deduction Board</h1>
        <p className="text-sm text-ink/60 mb-6">
          {clearances.length} of {suspects.length} suspects cleared. One of the rest is lying about
          murder.
        </p>
        <div className="grid sm:grid-cols-2 gap-4">
          {suspects.map((s) => {
            const clearance = clearanceBySuspect.get(s.id);
            return (
              <SuspectCard
                key={s.id}
                teamCode={team.teamCode}
                suspectId={s.id}
                name={s.name}
                role={s.role}
                flavourText={s.flavourText}
                cleared={Boolean(clearance)}
                clearReason={clearance?.reason ?? null}
                initialNote={noteBySuspect.get(s.id) ?? ""}
              />
            );
          })}
        </div>
      </main>
    </>
  );
}
