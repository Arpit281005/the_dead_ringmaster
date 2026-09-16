import Link from "next/link";
import { notFound } from "next/navigation";
import { getTeamState, getAllSuspectsPublic, TOTAL_STORY_NODES } from "@/lib/state";
import { getGameConfig } from "@/lib/admin-team-insight";
import TeamHeader from "@/components/TeamHeader";
import { prisma } from "@/lib/db";

export default async function MidwayPage({
  params,
}: {
  params: Promise<{ teamCode: string }>;
}) {
  const { teamCode } = await params;
  const state = await getTeamState(teamCode);
  if (state.phase === "not-found" || !state.team) notFound();

  const { team, nodes, clearances, phase } = state;
  const suspects = await getAllSuspectsPublic();
  const config = await getGameConfig();

  const correctVerdicts = await prisma.verdict.findMany({
    where: { teamId: team.id, wasCorrect: true },
  });
  const verdictByNode = new Map(correctVerdicts.map((v) => [v.nodeId, v]));
  const clearanceBySuspect = new Map(clearances.map((c) => [c.suspectId, c]));

  const lockedRemaining = Math.max(0, TOTAL_STORY_NODES - team.currentIndex - 1);

  return (
    <>
      <TeamHeader
        teamCode={team.teamCode}
        teamName={team.name}
        startedAt={team.startedAt}
        finishedAt={team.finishedAt}
        penaltySeconds={team.penaltySeconds}
        pausedSeconds={team.pausedSeconds}
        isPaused={config.isPaused}
        broadcastMessage={config.broadcastMessage}
        organiserHint={team.organiserHint}
        clearedCount={clearances.length}
        totalSuspects={suspects.length}
        active="midway"
      />
      <main className="flex-1 px-5 py-8 max-w-2xl mx-auto w-full">
        <h1 className="font-display text-2xl font-black mb-1">The Midway</h1>
        <p className="text-sm text-ink/60 mb-8">
          {phase === "finished"
            ? "Your hunt is over."
            : phase === "accusation"
            ? "Every tent is lit. Only the Accusation remains."
            : `${lockedRemaining} tent${lockedRemaining === 1 ? "" : "s"} remain fogged ahead.`}
        </p>

        <div className="relative flex flex-col gap-0">
          {nodes.map((node, i) => {
            const isCompleted = node.sequenceIndex < team.currentIndex;
            const isCurrent = node.sequenceIndex === team.currentIndex && phase !== "finished" && phase !== "accusation";
            const isLocked = !isCompleted && !isCurrent;
            const verdict = verdictByNode.get(node.id);
            const clearance = node.suspectId ? clearanceBySuspect.get(node.suspectId) : undefined;
            const isLast = i === nodes.length - 1;

            return (
              <div key={node.id} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <div
                    className={
                      "w-4 h-4 rounded-full border-2 shrink-0 mt-1 " +
                      (isCompleted
                        ? "bg-gold border-gold-bright bulb"
                        : isCurrent
                        ? "bg-oxblood border-gold-bright bulb"
                        : "bg-transparent border-ink/25")
                    }
                  />
                  {!isLast && (
                    <div
                      className={
                        "w-[3px] flex-1 min-h-16 " +
                        (isCompleted ? "string-lights-lit" : "string-lights-unlit")
                      }
                    />
                  )}
                </div>

                <div className="flex-1 pb-8">
                  {isCompleted && (
                    <div className="paper-card rounded-sm p-4">
                      <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/50">
                        Act {node.act} · Tent {i + 1}
                      </p>
                      <p className="font-display font-bold text-lg">{node.suspect?.name ?? node.locationName}</p>
                      <p className="text-xs text-ink/60 mb-2">{node.locationName}</p>
                      {verdict && (
                        <span className="ink-stamp inline-block font-chrome text-xs uppercase px-2 py-0.5 rounded-sm mb-2">
                          {verdict.choice === "TRUTH" ? "Verdict: Truth" : "Verdict: Lie"}
                        </span>
                      )}
                      {clearance ? (
                        <p className="text-xs text-teal">{clearance.reason}</p>
                      ) : (
                        <p className="text-xs text-ink/50 italic">No one cleared here.</p>
                      )}
                    </div>
                  )}

                  {isCurrent && (
                    <div className="paper-card rounded-sm p-4 border-2 border-gold relative overflow-hidden">
                      <p className="font-chrome text-[11px] uppercase tracking-wide text-oxblood mb-1">
                        Act {node.act} · Tent {i + 1} · Current
                      </p>
                      <p className="font-display font-bold text-lg mb-1">{node.locationName}</p>
                      <p className="text-xs text-ink/60 mb-3">{node.locationDescription}</p>
                      {phase === "decoy-pending" ? (
                        <>
                          <p className="text-sm text-oxblood mb-3">
                            You were misled. Find the dead-end marker to continue.
                          </p>
                          <Link
                            href={`/team/${team.teamCode}/scan`}
                            className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm inline-block"
                          >
                            Scan Dead-End Code
                          </Link>
                        </>
                      ) : phase === "testimony" ? (
                        <Link
                          href={`/team/${team.teamCode}/testimony`}
                          className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm inline-block"
                        >
                          Enter the Tent
                        </Link>
                      ) : (
                        <Link
                          href={`/team/${team.teamCode}/scan`}
                          className="btn-oxblood font-chrome uppercase text-xs px-4 py-3 rounded-sm inline-block"
                        >
                          Scan to Enter
                        </Link>
                      )}
                    </div>
                  )}

                  {isLocked && (
                    <div className="paper-card rounded-sm p-4 relative overflow-hidden opacity-70">
                      <div className="fog-layer absolute inset-0 bg-ink/10 pointer-events-none" />
                      <p className="font-chrome text-[11px] uppercase tracking-wide text-ink/40 relative">
                        Tent {i + 1} · Fogged
                      </p>
                      <p className="text-ink/40 italic relative">A shape, unlit.</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {phase === "accusation" && (
          <Link
            href={`/team/${team.teamCode}/accuse`}
            className="btn-oxblood font-chrome uppercase text-sm py-4 rounded-sm shadow-md block text-center mt-4"
          >
            Proceed to the Accusation
          </Link>
        )}
        {phase === "finished" && (
          <Link
            href={`/team/${team.teamCode}/reveal`}
            className="btn-oxblood font-chrome uppercase text-sm py-4 rounded-sm shadow-md block text-center mt-4"
          >
            View the Reveal
          </Link>
        )}
      </main>
    </>
  );
}
