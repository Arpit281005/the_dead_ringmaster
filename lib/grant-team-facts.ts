import { prisma } from "@/lib/db";
import { resolveNodeContent, type DecoyRef } from "@/lib/node-content";
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

/**
 * Upsert Case Notes that would have been emitted by correct verdicts on tents
 * [0, upToExclusive). Used when organisers force-advance past fact emitters.
 */
export async function grantEmittedFactsBeforeIndex(
  teamId: string,
  teamSeed: string,
  upToExclusive: number
): Promise<string[]> {
  const decoys = await loadDecoyRefs();
  const limit = Math.min(Math.max(0, upToExclusive), TOTAL_STORY_NODES);
  const granted: string[] = [];

  for (let i = 0; i < limit; i++) {
    const resolved = resolveNodeContent(i, teamSeed, decoys);
    if (!resolved.emitsFact) continue;
    const fact = resolved.emitsFact;
    await prisma.teamFact.upsert({
      where: { teamId_factKey: { teamId, factKey: fact.key } },
      update: {
        text: fact.text,
        cipherKey: fact.cipherKey ?? null,
      },
      create: {
        teamId,
        factKey: fact.key,
        text: fact.text,
        cipherKey: fact.cipherKey ?? null,
        sourceSequenceIndex: i,
      },
    });
    granted.push(fact.key);
  }

  return granted;
}
