import { notFound, redirect } from "next/navigation";
import { getTeamState, getAllSuspects } from "@/lib/state";
import AccusationForm from "@/components/AccusationForm";

export default async function AccusePage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const state = await getTeamState(teamCode);
  if (state.phase === "not-found" || !state.team) notFound();
  if (state.phase === "finished") redirect(`/team/${teamCode}/reveal`);
  if (state.phase !== "accusation") redirect(`/team/${teamCode}`);

  const suspects = await getAllSuspects();
  const clearedIds = new Set(state.clearances.map((c) => c.suspectId));
  const uncleared = suspects.filter((s) => !clearedIds.has(s.id));

  return (
    <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">The Accusation</h1>
      <p className="text-sm text-ink/60 mb-6">
        Every other tent has spoken. Name who is left standing, and say why.
      </p>
      <AccusationForm teamCode={teamCode} suspects={uncleared} />
    </main>
  );
}
