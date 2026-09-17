import { prisma } from "@/lib/db";
import { resolveNodeContent, type DecoyRef } from "@/lib/node-content";
import { toTeamPublic, type TeamPublic } from "@/lib/team-access";
export { formatDuration } from "@/lib/format";
export type { TeamPublic };

export const TOTAL_STORY_NODES = 8;

export type TeamPhase =
  | "not-found"
  | "need-scan"
  | "testimony"
  | "decoy-pending"
  | "accusation"
  | "finished";

/**
 * Content shipping checklist (never pre-scan):
 * - No testimony / isTruthful / brokenMark / riddles / cipherKey / accusationFactKeyword
 * - No teamSeed / contact / members in page DTOs (use TeamPublic)
 * - Midway locked tents: fog UI only (names not rendered)
 */

/** Midway / phase fields only — never includes testimony, riddles, isTruthful, or token. */
const storyNodePublicSelect = {
  id: true,
  sequenceIndex: true,
  suspectId: true,
  locationName: true,
  act: true,
  suspect: { select: { id: true, name: true } },
} as const;

export type StoryNodePublic = Awaited<ReturnType<typeof getAllStoryNodes>>[number];

/** Server-only full team (includes teamSeed). Prefer toTeamPublic for pages. */
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
    needsKey: resolved.needsKey,
    keyPrompt: resolved.keyPrompt,
  };
}

/** Stage1 + metadata when a verdict is waiting on the Act II+ cipher unlock. */
export async function getPendingRiddleUnlock(teamCode: string, nodeId: string) {
  const team = await getTeamByCode(teamCode);
  if (!team) return null;

  const node = await prisma.node.findUnique({
    where: { id: nodeId },
    select: { id: true, sequenceIndex: true, isDecoy: true, suspect: { select: { name: true } } },
  });
  if (!node || node.isDecoy || node.sequenceIndex < 3) return null;

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: node.id },
    orderBy: { submittedAt: "desc" },
  });
  if (!lastVerdict || lastVerdict.riddleUnlocked) return null;

  const decoys = await loadDecoyRefs();
  const resolved = resolveNodeContent(node.sequenceIndex, team.teamSeed, decoys);
  if (!resolved.needsKey) return null;

  const stage1 =
    lastVerdict.choice === "TRUTH" ? resolved.riddlePlain : resolved.riddleMirrored;

  let clearedSuspectName: string | null = null;
  if (lastVerdict.wasCorrect && resolved.clearReason && node.suspect) {
    clearedSuspectName = node.suspect.name;
  }

  return {
    wasCorrect: lastVerdict.wasCorrect,
    riddle: stage1,
    needsKey: true as const,
    keyPrompt: resolved.keyPrompt,
    clearedSuspectName,
    advanced: false,
    huntComplete: false,
  };
}

/** Minimal last-verdict surface for UI flags — not full row. */
export type LastVerdictSummary = {
  wasCorrect: boolean;
  riddleUnlocked: boolean;
};

export async function getTeamState(teamCode: string) {
  const raw = await getTeamByCode(teamCode);
  if (!raw) {
    return { phase: "not-found" as TeamPhase, team: null } as const;
  }
  const team = toTeamPublic(raw);

  const nodes = await getAllStoryNodes();
  const clearances = await prisma.clearance.findMany({
    where: { teamId: raw.id },
  });
  const accusation = await prisma.accusation.findUnique({
    where: { teamId: raw.id },
    include: { suspect: { select: { id: true, name: true } } },
  });

  if (raw.status === "FINISHED" || accusation) {
    return {
      phase: "finished" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation,
      currentNode: null,
    } as const;
  }

  if (raw.currentIndex >= TOTAL_STORY_NODES) {
    return {
      phase: "accusation" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation: null,
      currentNode: null,
    } as const;
  }

  const currentNode = nodes.find((n) => n.sequenceIndex === raw.currentIndex) ?? null;
  if (!currentNode) {
    return {
      phase: "not-found" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation: null,
      currentNode: null,
    } as const;
  }

  const scan = await prisma.scan.findFirst({
    where: { teamId: raw.id, nodeId: currentNode.id, wasValid: true },
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

  const lastVerdictRow = await prisma.verdict.findFirst({
    where: { teamId: raw.id, nodeId: currentNode.id },
    orderBy: { submittedAt: "desc" },
  });
  const lastVerdict: LastVerdictSummary | null = lastVerdictRow
    ? { wasCorrect: lastVerdictRow.wasCorrect, riddleUnlocked: lastVerdictRow.riddleUnlocked }
    : null;

  if (lastVerdictRow && !lastVerdictRow.riddleUnlocked && currentNode.sequenceIndex >= 3) {
    return {
      phase: "testimony" as TeamPhase,
      team,
      nodes,
      clearances,
      accusation: null,
      currentNode,
      lastVerdict,
      awaitingRiddleUnlock: true,
    } as const;
  }

  if (lastVerdictRow && !lastVerdictRow.wasCorrect) {
    const decoyScan = await prisma.scan.findFirst({
      where: {
        teamId: raw.id,
        wasValid: true,
        scannedAt: { gt: lastVerdictRow.submittedAt },
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
    awaitingRiddleUnlock: false as const,
  } as const;
}

export function elapsedSeconds(team: { startedAt: Date; finishedAt: Date | null }) {
  const end = team.finishedAt ?? new Date();
  return Math.max(0, Math.floor((end.getTime() - team.startedAt.getTime()) / 1000));
}
