import { notFound, redirect } from "next/navigation";
import { getTeamState, getAllSuspectsPublic } from "@/lib/state";
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

  const suspects = await getAllSuspectsPublic();
  const clearedIds = new Set(state.clearances.map((c) => c.suspectId));
  const uncleared = suspects
    .filter((s) => !clearedIds.has(s.id))
    .map((s) => ({
      id: s.id,
      name: s.name,
      role: s.role,
      flavourText: s.flavourText,
    }));

  return (
    <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
      <h1 className="font-display text-2xl font-black mb-1">The Accusation</h1>
      <p className="text-sm text-ink/60 mb-6">
        Every other tent has spoken. Name who remains, how Orlan died, and which Case File
        fact seals their guilt — then one sentence for the judges.
      </p>
      <AccusationForm teamCode={teamCode} suspects={uncleared} />
    </main>
  );
}
