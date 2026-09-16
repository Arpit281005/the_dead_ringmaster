import { prisma } from "@/lib/db";
import { resolveNodeContent, type DecoyRef } from "@/lib/node-content";
export { formatDuration } from "@/lib/format";

export const TOTAL_STORY_NODES = 8;

export type TeamPhase =
  | "not-found"
  | "need-scan"
  | "testimony"
  | "decoy-pending"
  | "accusation"
  | "finished";

/** Midway / phase fields only — never includes testimony, riddles, isTruthful, or token. */
const storyNodePublicSelect = {
  id: true,
  sequenceIndex: true,
  suspectId: true,
  locationName: true,
  locationDescription: true,
  act: true,
  suspect: { select: { id: true, name: true } },
} as const;

export type StoryNodePublic = Awaited<ReturnType<typeof getAllStoryNodes>>[number];

export async function getTeamByCode(teamCode: string) {
  return prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
}

export async function getAllStoryNodes() {
  return prisma.node.findMany({
    where: { isDecoy: false },
    orderBy: { sequenceIndex: "asc" },
    select: storyNodePublicSelect,
  });
}

/** Safe suspect fields for client components — never includes isMurderer. */
export async function getAllSuspectsPublic() {
  return prisma.suspect.findMany({
    orderBy: { order: "asc" },
    select: {
      id: true,
      name: true,
      role: true,
      flavourText: true,
      order: true,
    },
  });
}

async function loadDecoyRefs(): Promise<DecoyRef[]> {
  const decoys = await prisma.node.findMany({
    where: { isDecoy: true },
    select: { id: true, locationName: true, decoyPool: true },
  });
  return decoys
    .filter((d): d is typeof d & { decoyPool: string } => Boolean(d.decoyPool))
    .map((d) => ({ id: d.id, locationName: d.locationName, decoyPool: d.decoyPool }));
}

/**
 * Testimony content — only after a valid scan (caller must enforce phase).
 * Resolved from teamSeed; never reads static narrative columns.
 */
export async function getNodeTestimony(teamCode: string, nodeId: string) {
  const team = await getTeamByCode(teamCode);
  if (!team) return null;

  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: {
      id: true,
      sequenceIndex: true,
      isDecoy: true,
      locationName: true,
      suspect: { select: { name: true } },
    },
  });
  if (!node || node.isDecoy) return null;

  const scan = await prisma.scan.findFirst({
    where: { teamId: team.id, nodeId: node.id, wasValid: true },
  });
  if (!scan) return null;

  const decoys = await loadDecoyRefs();
  const resolved = resolveNodeContent(node.sequenceIndex, team.teamSeed, decoys);

  return {
    id: node.id,
    locationName: node.locationName,
    suspectName: node.suspect?.name ?? "A Voice from the Dark",
    testimonyText: resolved.testimonyText,
  };
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
    include: { suspect: { select: { id: true, name: true } } },
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
