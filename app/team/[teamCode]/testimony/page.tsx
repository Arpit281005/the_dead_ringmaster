import { notFound, redirect } from "next/navigation";
import { getTeamState, getNodeTestimony } from "@/lib/state";
import VerdictPanel from "@/components/VerdictPanel";

export default async function TestimonyPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const state = await getTeamState(teamCode);

  if (state.phase === "not-found" || !state.team) notFound();
  if (state.phase === "need-scan") redirect(`/team/${teamCode}/scan`);
  if (state.phase === "decoy-pending") redirect(`/team/${teamCode}/scan`);
  if (state.phase === "accusation") redirect(`/team/${teamCode}/accuse`);
  if (state.phase === "finished") redirect(`/team/${teamCode}/reveal`);

  const current = state.currentNode!;
  const node = await getNodeTestimony(teamCode, current.id);
  if (!node) notFound();

  return (
    <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
      <VerdictPanel
        teamCode={teamCode}
        nodeId={node.id}
        suspectName={node.suspectName}
        locationName={node.locationName}
        testimonyText={node.testimonyText}
        retrying={Boolean(state.lastVerdict && !state.lastVerdict.wasCorrect)}
      />
    </main>
  );
}
