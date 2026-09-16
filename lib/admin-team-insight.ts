import { prisma } from "@/lib/db";
import { resolveNodeContent, type DecoyRef } from "@/lib/node-content";
import { STORY_TEMPLATES } from "@/lib/node-content/templates";
import { TOTAL_STORY_NODES } from "@/lib/state";

async function loadDecoyRefs(): Promise<DecoyRef[]> {
  const decoys = await prisma.node.findMany({
    where: { isDecoy: true },
    select: { id: true, locationName: true, decoyPool: true },
  });
  return decoys
    .filter((d): d is typeof d & { decoyPool: string } => Boolean(d.decoyPool))
    .map((d) => ({ id: d.id, locationName: d.locationName, decoyPool: d.decoyPool }));
}

export type NodeVariantSummary = {
  sequenceIndex: number;
  isTruthful: boolean;
  brokenMark: string;
  decoyLocationName: string;
  mirrorStyle: string;
  needsKey: boolean;
  cipherKey: string | null;
  accusationFactKeyword: string | null;
};

export async function getTeamVariantSummaries(teamSeed: string): Promise<NodeVariantSummary[]> {
  const decoys = await loadDecoyRefs();
  const out: NodeVariantSummary[] = [];
  for (let i = 0; i < TOTAL_STORY_NODES; i++) {
    const r = resolveNodeContent(i, teamSeed, decoys);
    out.push({
      sequenceIndex: i,
      isTruthful: r.isTruthful,
      brokenMark: r.brokenMark,
      decoyLocationName: r.decoyLocationName,
      mirrorStyle: r.mirrorStyle,
      needsKey: r.needsKey,
      cipherKey: r.cipherKey,
      accusationFactKeyword: r.accusationFactKeyword,
    });
  }
  return out;
}

export async function getAccusationReadiness(teamId: string, currentIndex: number, teamSeed: string) {
  const facts = await prisma.teamFact.findMany({
    where: { teamId },
    select: { factKey: true },
  });
  const have = new Set(facts.map((f) => f.factKey));

  const upcomingMissing: { sequenceIndex: number; missingKeys: string[] }[] = [];
  for (const t of STORY_TEMPLATES) {
    if (t.sequenceIndex < currentIndex) continue;
    const missing = t.dependsOnFactKeys.filter((k) => !have.has(k));
    if (missing.length > 0) {
      upcomingMissing.push({ sequenceIndex: t.sequenceIndex, missingKeys: missing });
    }
  }

  const clearances = await prisma.clearance.findMany({
    where: { teamId },
    select: { suspectId: true },
  });
  const suspects = await prisma.suspect.findMany({ select: { id: true } });
  const cleared = new Set(clearances.map((c) => c.suspectId));
  const unclearedCount = suspects.filter((s) => !cleared.has(s.id)).length;

  const accusation = await prisma.accusation.findUnique({
    where: { teamId },
    include: { suspect: { select: { name: true } } },
  });

  const decoys = await loadDecoyRefs();
  const ostrin = resolveNodeContent(6, teamSeed, decoys);

  return {
    readyForAccusation: currentIndex >= TOTAL_STORY_NODES,
    unclearedCount,
    upcomingMissing,
    accusation: accusation
      ? {
          suspectName: accusation.suspect.name,
          wasCorrect: accusation.wasCorrect,
          suspectCorrect: accusation.suspectCorrect,
          methodCorrect: accusation.methodCorrect,
          factCorrect: accusation.factCorrect,
          methodSubmitted: accusation.methodSubmitted,
          factKeywordSubmitted: accusation.factKeywordSubmitted,
        }
      : null,
    expectedAccusationFactKeyword: ostrin.accusationFactKeyword,
  };
}

export async function getGameConfig() {
  let config = await prisma.gameConfig.findUnique({ where: { id: "singleton" } });
  if (!config) {
    config = await prisma.gameConfig.create({
      data: { id: "singleton", eventName: "The Carnival of Lies" },
    });
  }
  return config;
}

const STUCK_MS = 15 * 60 * 1000;

export async function listTeamsForAdmin() {
  const teams = await prisma.team.findMany({
    orderBy: { startedAt: "asc" },
    include: {
      accusation: { select: { id: true, wasCorrect: true } },
      _count: {
        select: {
          securityFlags: { where: { acknowledgedAt: null } },
        },
      },
    },
  });
  const nodes = await prisma.node.findMany({
    where: { isDecoy: false },
    select: { sequenceIndex: true, locationName: true, act: true },
  });
  const byIndex = new Map(nodes.map((n) => [n.sequenceIndex, n]));

  const now = Date.now();
  return Promise.all(
    teams.map(async (t) => {
      const node = byIndex.get(t.currentIndex);
      let stuck = false;
      if (t.status === "ACTIVE" && t.currentIndex < TOTAL_STORY_NODES && node) {
        const storyNode = await prisma.node.findFirst({
          where: { sequenceIndex: t.currentIndex, isDecoy: false },
          select: { id: true },
        });
        if (storyNode) {
          const lastScan = await prisma.scan.findFirst({
            where: { teamId: t.id, nodeId: storyNode.id, wasValid: true },
            orderBy: { scannedAt: "desc" },
          });
          if (lastScan && now - lastScan.scannedAt.getTime() > STUCK_MS) stuck = true;
          if (!lastScan && now - t.startedAt.getTime() > STUCK_MS && t.currentIndex === 0) {
            // waiting on first tent longer than 15m with no scan — not stuck on node
          }
        }
      }

      let phaseLabel: string;
      if (t.status === "FINISHED" || t.accusation) phaseLabel = "Finished";
      else if (t.currentIndex >= TOTAL_STORY_NODES) phaseLabel = "Accusation";
      else phaseLabel = node?.locationName ?? `Tent ${t.currentIndex + 1}`;

      const act =
        t.currentIndex >= TOTAL_STORY_NODES
          ? 3
          : (node?.act ?? Math.min(3, Math.floor(t.currentIndex / 3) + 1));

      const elapsed = Math.max(
        0,
        Math.floor(
          ((t.finishedAt ?? new Date()).getTime() - t.startedAt.getTime()) / 1000
        ) - t.pausedSeconds
      );

      return {
        id: t.id,
        teamCode: t.teamCode,
        name: t.name,
        status: t.status,
        currentIndex: t.currentIndex,
        phaseLabel,
        act,
        penaltySeconds: t.penaltySeconds,
        pausedSeconds: t.pausedSeconds,
        elapsedSeconds: elapsed,
        stuck,
        openFlagCount: t._count.securityFlags,
        accusationCorrect: t.accusation?.wasCorrect ?? null,
      };
    })
  );
}

