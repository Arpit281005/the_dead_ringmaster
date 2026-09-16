import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin-auth";
import {
  getAccusationReadiness,
  getTeamVariantSummaries,
} from "@/lib/admin-team-insight";
import { prisma } from "@/lib/db";
import { formatDuration } from "@/lib/format";
import { TOTAL_STORY_NODES } from "@/lib/state";
import { TeamMutationPanel } from "@/components/admin/AdminControls";

export const dynamic = "force-dynamic";

export default async function AdminTeamPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  await requireAdmin();
  const { teamCode } = await params;
  const team = await prisma.team.findUnique({
    where: { teamCode: teamCode.toUpperCase() },
  });
  if (!team) notFound();

  const variants = await getTeamVariantSummaries(team.teamSeed);
  const facts = await prisma.teamFact.findMany({
    where: { teamId: team.id },
    orderBy: { sourceSequenceIndex: "asc" },
  });
  const readiness = await getAccusationReadiness(team.id, team.currentIndex, team.teamSeed);
  const recentActions = await prisma.adminAction.findMany({
    where: { teamId: team.id },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const elapsed = Math.max(
    0,
    Math.floor(((team.finishedAt ?? new Date()).getTime() - team.startedAt.getTime()) / 1000) -
      team.pausedSeconds
  );

  return (
    <main className="flex-1 px-4 py-6 max-w-3xl mx-auto w-full flex flex-col gap-6">
      <div>
        <Link href="/admin" className="text-xs font-chrome uppercase text-ink/50">
          ← All teams
        </Link>
        <h1 className="font-display text-2xl font-black mt-2">{team.name}</h1>
        <p className="font-chrome text-sm text-ink/50">{team.teamCode}</p>
        <p className="text-sm mt-2">
          Index {team.currentIndex}/{TOTAL_STORY_NODES} · {formatDuration(elapsed)} (+
          {formatDuration(team.penaltySeconds)} pen · {formatDuration(team.pausedSeconds)} paused)
        </p>
        <p className="text-xs text-ink/50 mt-1">
          Seed prefix {team.teamSeed.slice(0, 12)}… (server-only)
        </p>
      </div>

      <TeamMutationPanel teamCode={team.teamCode} organiserHint={team.organiserHint} />

      <section>
        <h2 className="font-display text-lg font-bold mb-2">Case Notes unlocked</h2>
        {facts.length === 0 ? (
          <p className="text-sm text-ink/50">None yet.</p>
        ) : (
          <ul className="flex flex-col gap-2 text-sm">
            {facts.map((f) => (
              <li key={f.id} className="paper-card rounded-sm p-3">
                <p className="font-chrome text-[10px] uppercase text-ink/50">
                  {f.factKey}
                  {f.cipherKey ? ` · cipher ${f.cipherKey}` : ""} · from tent {f.sourceSequenceIndex + 1}
                </p>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-bold mb-2">Accusation readiness</h2>
        <div className="paper-card rounded-sm p-4 text-sm flex flex-col gap-2">
          {readiness.readyForAccusation ? (
            <p>Ready for Accusation · {readiness.unclearedCount} uncleared suspect(s).</p>
          ) : (
            <p>Still in hunt — not at Accusation yet.</p>
          )}
          {readiness.upcomingMissing.length > 0 && (
            <ul className="text-xs text-ink/70 list-disc pl-4">
              {readiness.upcomingMissing.map((m) => (
                <li key={m.sequenceIndex}>
                  Tent {m.sequenceIndex + 1} still needs: {m.missingKeys.join(", ")}
                </li>
              ))}
            </ul>
          )}
          {readiness.expectedAccusationFactKeyword && (
            <p className="text-xs text-ink/50">
              Expected Case File keystone keyword: {readiness.expectedAccusationFactKeyword}
            </p>
          )}
          {readiness.accusation && (
            <div className="border-t border-ink/10 pt-2 mt-1">
              <p>
                Submitted: {readiness.accusation.suspectName} —{" "}
                {readiness.accusation.wasCorrect ? "correct name" : "wrong name"}
              </p>
              <p className="text-xs">
                Method {readiness.accusation.methodCorrect ? "✓" : "✗"} · Fact{" "}
                {readiness.accusation.factCorrect ? "✓" : "✗"} · submitted “
                {readiness.accusation.methodSubmitted}” / {readiness.accusation.factKeywordSubmitted}
              </p>
            </div>
          )}
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold mb-2">Seeded variants</h2>
        <p className="text-xs text-ink/50 mb-2">
          Per-team truth/Mark/decoy — not full testimonies. Cipher keys for organiser unstick only.
        </p>
        <div className="overflow-x-auto border border-ink/15 rounded-sm">
          <table className="w-full text-xs">
            <thead className="bg-ink/5 font-chrome uppercase text-ink/50">
              <tr>
                <th className="text-left p-2">#</th>
                <th className="text-left p-2">Truth?</th>
                <th className="text-left p-2">Mark</th>
                <th className="text-left p-2">Decoy</th>
                <th className="text-left p-2">Mirror</th>
                <th className="text-left p-2">Key</th>
              </tr>
            </thead>
            <tbody>
              {variants.map((v) => (
                <tr key={v.sequenceIndex} className="border-t border-ink/10">
                  <td className="p-2">{v.sequenceIndex + 1}</td>
                  <td className="p-2">{v.isTruthful ? "T" : "L"}</td>
                  <td className="p-2">{v.brokenMark}</td>
                  <td className="p-2">{v.decoyLocationName}</td>
                  <td className="p-2">{v.mirrorStyle}</td>
                  <td className="p-2 font-chrome">
                    {v.cipherKey ?? "—"}
                    {v.accusationFactKeyword ? ` / ${v.accusationFactKeyword}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="font-display text-lg font-bold mb-2">Admin actions (this team)</h2>
        {recentActions.length === 0 ? (
          <p className="text-sm text-ink/50">None logged.</p>
        ) : (
          <ul className="text-xs flex flex-col gap-1">
            {recentActions.map((a) => (
              <li key={a.id} className="font-chrome text-ink/70">
                {a.createdAt.toISOString()} · {a.actionType} · {a.payload}
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
