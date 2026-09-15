import { prisma } from "@/lib/db";
export { formatDuration } from "@/lib/format";

export const TOTAL_STORY_NODES = 8;

export type TeamPhase =
  | "not-found"
  | "need-scan"
  | "testimony"
  | "decoy-pending"
  | "accusation"
  | "finished";

export async function getTeamByCode(teamCode: string) {
  return prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
}

export async function getAllStoryNodes() {
  return prisma.node.findMany({
    where: { isDecoy: false },
    orderBy: { sequenceIndex: "asc" },
    include: { suspect: true },
  });
}

export async function getAllSuspects() {
  return prisma.suspect.findMany({ orderBy: { order: "asc" } });
}

export async function getTeamState(teamCode: string) {
  const team = await getTeamByCode(teamCode);
  if (!team) {
    return { phase: "not-found" as TeamPhase, team: null } as const;
  }

  const nodes = await getAllStoryNodes();
  const clearances = await prisma.clearance.findMany({
    where: { teamId: team.id },
  });
  const accusation = await prisma.accusation.findUnique({
    where: { teamId: team.id },
    include: { suspect: true },
  });

  if (team.status === "FINISHED" || accusation) {
    return {
      phase: "finished" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation,
      currentNode: null,
    } as const;
  }

  if (team.currentIndex >= TOTAL_STORY_NODES) {
    return {
      phase: "accusation" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation: null,
      currentNode: null,
    } as const;
  }

  const currentNode = nodes.find((n) => n.sequenceIndex === team.currentIndex) ?? null;
  if (!currentNode) {
    return { phase: "not-found" as TeamPhase, team, nodes, clearances, accusation: null, currentNode: null } as const;
  }

  const scan = await prisma.scan.findFirst({
    where: { teamId: team.id, nodeId: currentNode.id, wasValid: true },
  });

  if (!scan) {
    return {
      phase: "need-scan" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation: null,
      currentNode,
    } as const;
  }

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: currentNode.id },
    orderBy: { submittedAt: "desc" },
  });

  if (lastVerdict && !lastVerdict.wasCorrect) {
    const decoyScan = await prisma.scan.findFirst({
      where: {
        teamId: team.id,
        wasValid: true,
        scannedAt: { gt: lastVerdict.submittedAt },
        node: { isDecoy: true },
      },
    });
    if (!decoyScan) {
      return {
        phase: "decoy-pending" as TeamPhase,
        team,
        nodes,
        clearances,
        accusation: null,
        currentNode,
        lastVerdict,
      } as const;
    }
  }

  return {
    phase: "testimony" as TeamPhase,
    team,
    nodes,
    clearances,
    accusation: null,
    currentNode,
    lastVerdict,
  } as const;
}

export function elapsedSeconds(team: { startedAt: Date; finishedAt: Date | null }) {
  const end = team.finishedAt ?? new Date();
  return Math.max(0, Math.floor((end.getTime() - team.startedAt.getTime()) / 1000));
}
