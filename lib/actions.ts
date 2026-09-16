"use server";

import { prisma } from "@/lib/db";
import { TOTAL_STORY_NODES } from "@/lib/state";
import { SOLUTION_TEXT } from "@/lib/content";
import { verifySignedQrPayload } from "@/lib/qr-token";
import { checkRateLimit } from "@/lib/rate-limit";
import { deriveTeamSeed } from "@/lib/team-seed";
import { resolveNodeContent, type DecoyRef } from "@/lib/node-content";
import {
  getAccusationExpectations,
  extractMethodKeyword,
  normalizeAccusationToken,
} from "@/lib/node-content/accusation";
import { normalizeCipherKey } from "@/lib/node-content/riddle-cipher";
import { customAlphabet } from "nanoid";

const DECOY_PENALTY_SECONDS = 5 * 60;
const SCAN_RATE_LIMIT = { limit: 10, windowMs: 60_000 };
const codeDigits = customAlphabet("0123456789", 4);
const NAME_WORDS = /[A-Za-z]+/g;

function generateTeamCode(name: string) {
  const words = name.match(NAME_WORDS) ?? ["VEX"];
  const prefix = (words[0].slice(0, 4) || "VEX").toUpperCase();
  return `${prefix}-${codeDigits()}`;
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

async function resolveForTeam(teamSeed: string, sequenceIndex: number) {
  const decoys = await loadDecoyRefs();
  return resolveNodeContent(sequenceIndex, teamSeed, decoys);
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createTeam(input: {
  name: string;
  members: string[];
  contact: string;
}): Promise<ActionResult<{ teamCode: string }>> {
  const name = input.name.trim();
  const members = input.members.map((m) => m.trim()).filter(Boolean);
  const contact = input.contact.trim();

  if (!name) return { ok: false, error: "Give your team a name." };
  if (members.length === 0) return { ok: false, error: "Add at least one member." };
  if (!contact) return { ok: false, error: "A contact number is required." };

  let teamCode = generateTeamCode(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await prisma.team.findUnique({ where: { teamCode } });
    if (!clash) break;
    teamCode = generateTeamCode(name);
  }

  await prisma.team.create({
    data: {
      teamCode,
      name,
      members: JSON.stringify(members),
      contact,
      teamSeed: deriveTeamSeed(teamCode),
      currentIndex: 0,
    },
  });

  return { ok: true, data: { teamCode } };
}

export async function joinTeam(teamCodeInput: string): Promise<ActionResult<{ teamCode: string }>> {
  const teamCode = teamCodeInput.trim().toUpperCase();
  const team = await prisma.team.findUnique({ where: { teamCode } });
  if (!team) return { ok: false, error: "No team carries that code. Check with your Notebook holder." };
  return { ok: true, data: { teamCode: team.teamCode } };
}

type ScanResult =
  | { valid: true; kind: "story"; nodeId: string }
  | { valid: true; kind: "decoy"; passage: string; locationName: string }
  | { valid: false; reason: string };

export async function scanNode(teamCode: string, rawToken: string): Promise<ActionResult<ScanResult>> {
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false, error: "Team not found." };
  if (team.status === "FINISHED") return { ok: false, error: "This team has already finished the hunt." };

  const rate = checkRateLimit(`scan:${team.id}`, SCAN_RATE_LIMIT);
  if (!rate.allowed) {
    return {
      ok: true,
      data: {
        valid: false,
        reason: "Too many attempts — wait a moment before scanning again.",
      },
    };
  }

  const verified = verifySignedQrPayload(rawToken);
  if (!verified) {
    return {
      ok: true,
      data: { valid: false, reason: "That code doesn't match any tent in the fairground." },
    };
  }

  const node = await prisma.node.findFirst({
    where: { id: verified.nodeId, token: verified.nonce },
  });
  if (!node) {
    return { ok: true, data: { valid: false, reason: "That code doesn't match any tent in the fairground." } };
  }

  if (node.isDecoy) {
    const lastVerdict = await prisma.verdict.findFirst({
      where: { teamId: team.id, node: { sequenceIndex: team.currentIndex } },
      orderBy: { submittedAt: "desc" },
    });

    const resolved =
      lastVerdict && !lastVerdict.wasCorrect
        ? await resolveForTeam(team.teamSeed, team.currentIndex)
        : null;
    const servesCurrent = Boolean(resolved && resolved.decoyNodeId === node.id);

    if (!servesCurrent) {
      await prisma.scan.create({
        data: { teamId: team.id, nodeId: node.id, wasValid: false, rejectionReason: "decoy-not-applicable" },
      });
      return {
        ok: true,
        data: { valid: false, reason: "This dead end isn't yours to find — not yet, anyway." },
      };
    }

    // Idempotent: same decoy after this wrong verdict must not double-penalise.
    const existingDecoy = await prisma.scan.findFirst({
      where: {
        teamId: team.id,
        nodeId: node.id,
        wasValid: true,
        scannedAt: { gt: lastVerdict!.submittedAt },
      },
    });
    if (existingDecoy) {
      return {
        ok: true,
        data: {
          valid: true,
          kind: "decoy",
          passage: node.decoyPassage ?? "You have been misled.",
          locationName: node.locationName,
        },
      };
    }

    await prisma.scan.create({ data: { teamId: team.id, nodeId: node.id, wasValid: true } });
    await prisma.team.update({
      where: { id: team.id },
      data: { penaltySeconds: { increment: DECOY_PENALTY_SECONDS } },
    });

    return {
      ok: true,
      data: {
        valid: true,
        kind: "decoy",
        passage: node.decoyPassage ?? "You have been misled.",
        locationName: node.locationName,
      },
    };
  }

  if (node.sequenceIndex !== team.currentIndex) {
    const reason =
      node.sequenceIndex < team.currentIndex
        ? "You have already walked this tent — its story is told."
        : "This tent is not yet yours.";
    await prisma.scan.create({
      data: { teamId: team.id, nodeId: node.id, wasValid: false, rejectionReason: "out-of-order" },
    });
    return { ok: true, data: { valid: false, reason } };
  }

  const existing = await prisma.scan.findFirst({
    where: { teamId: team.id, nodeId: node.id, wasValid: true },
  });
  if (!existing) {
    await prisma.scan.create({ data: { teamId: team.id, nodeId: node.id, wasValid: true } });
  }

  return { ok: true, data: { valid: true, kind: "story", nodeId: node.id } };
}

type VerdictResult = {
  wasCorrect: boolean;
  riddle: string;
  clearedSuspectName: string | null;
  advanced: boolean;
  huntComplete: boolean;
  needsKey: boolean;
  keyPrompt: string | null;
};

export async function submitVerdict(
  teamCode: string,
  nodeId: string,
  choice: "TRUTH" | "LIE"
): Promise<ActionResult<VerdictResult>> {
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false, error: "Team not found." };

  const node = await prisma.node.findUnique({ where: { id: nodeId }, include: { suspect: true } });
  if (!node) return { ok: false, error: "Testimony not found." };
  if (node.isDecoy) return { ok: false, error: "Testimony not found." };
  if (node.sequenceIndex !== team.currentIndex) {
    return { ok: false, error: "This testimony is no longer active for your team." };
  }

  const scan = await prisma.scan.findFirst({ where: { teamId: team.id, nodeId: node.id, wasValid: true } });
  if (!scan) return { ok: false, error: "Scan the tent's code before rendering a verdict." };

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: node.id },
    orderBy: { submittedAt: "desc" },
  });
  if (lastVerdict?.wasCorrect) {
    return { ok: false, error: "Unlock the cipher before you leave this tent." };
  }
  if (lastVerdict && !lastVerdict.wasCorrect) {
    if (!lastVerdict.riddleUnlocked && node.sequenceIndex >= 3) {
      return { ok: false, error: "Unlock the cipher before you leave this tent." };
    }
    const decoyScan = await prisma.scan.findFirst({
      where: {
        teamId: team.id,
        wasValid: true,
        scannedAt: { gt: lastVerdict.submittedAt },
        node: { isDecoy: true },
      },
    });
    if (!decoyScan) {
      return { ok: false, error: "Find the dead-end marker before you try this verdict again." };
    }
  }

  const resolved = await resolveForTeam(team.teamSeed, node.sequenceIndex);

  if (resolved.dependsOnFactKeys.length > 0) {
    const have = await prisma.teamFact.findMany({
      where: { teamId: team.id, factKey: { in: resolved.dependsOnFactKeys } },
      select: { factKey: true },
    });
    const haveKeys = new Set(have.map((f) => f.factKey));
    const missing = resolved.dependsOnFactKeys.filter((k) => !haveKeys.has(k));
    if (missing.length > 0) {
      return {
        ok: false,
        error:
          "This tent will not yield to a lone reading — return to your Deduction Board and weigh what you have already proved.",
      };
    }
  }

  const wasCorrect = (choice === "TRUTH") === resolved.isTruthful;
  const riddle = choice === "TRUTH" ? resolved.riddlePlain : resolved.riddleMirrored;

  await prisma.verdict.create({
    data: { teamId: team.id, nodeId: node.id, choice, wasCorrect },
  });

  let clearedSuspectName: string | null = null;
  let advanced = false;
  let huntComplete = false;

  if (wasCorrect) {
    if (resolved.emitsFact) {
      await prisma.teamFact.upsert({
        where: {
          teamId_factKey: { teamId: team.id, factKey: resolved.emitsFact.key },
        },
        update: {
          text: resolved.emitsFact.text,
          cipherKey: resolved.emitsFact.cipherKey ?? null,
        },
        create: {
          teamId: team.id,
          factKey: resolved.emitsFact.key,
          text: resolved.emitsFact.text,
          cipherKey: resolved.emitsFact.cipherKey ?? null,
          sourceSequenceIndex: node.sequenceIndex,
        },
      });
    }

    if (resolved.clearReason && node.suspectId) {
      const already = await prisma.clearance.findFirst({
        where: { teamId: team.id, suspectId: node.suspectId },
      });
      if (!already) {
        await prisma.clearance.create({
          data: {
            teamId: team.id,
            suspectId: node.suspectId,
            nodeId: node.id,
            reason: resolved.clearReason,
          },
        });
      }
      clearedSuspectName = node.suspect?.name ?? null;
    }

    // Act II+: do not advance Midway until riddle is unlocked with the on-site key.
    if (!resolved.needsKey) {
      const nextIndex = node.sequenceIndex + 1;
      await prisma.team.update({ where: { id: team.id }, data: { currentIndex: nextIndex } });
      advanced = true;
      huntComplete = nextIndex >= TOTAL_STORY_NODES;
    }
  }

  return {
    ok: true,
    data: {
      wasCorrect,
      riddle,
      clearedSuspectName,
      advanced,
      huntComplete,
      needsKey: resolved.needsKey,
      keyPrompt: resolved.keyPrompt,
    },
  };
}

type UnlockResult = {
  riddle: string;
  advanced: boolean;
  huntComplete: boolean;
  clearedSuspectName: string | null;
};

export async function unlockRiddle(
  teamCode: string,
  nodeId: string,
  rawKey: string
): Promise<ActionResult<UnlockResult>> {
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false, error: "Team not found." };

  const rate = checkRateLimit(`unlock:${team.id}`, { limit: 20, windowMs: 60_000 });
  if (!rate.allowed) {
    return { ok: false, error: "Too many cipher attempts — wait a moment." };
  }

  const node = await prisma.node.findUnique({ where: { id: nodeId }, include: { suspect: true } });
  if (!node || node.isDecoy) return { ok: false, error: "Riddle not found." };
  if (node.sequenceIndex !== team.currentIndex) {
    return { ok: false, error: "This tent's cipher is no longer in play." };
  }

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: node.id },
    orderBy: { submittedAt: "desc" },
  });
  if (!lastVerdict) {
    return { ok: false, error: "Render a verdict before unlocking the riddle." };
  }

  const resolved = await resolveForTeam(team.teamSeed, node.sequenceIndex);
  if (!resolved.needsKey || !resolved.cipherKey) {
    return { ok: false, error: "This tent needs no cipher key." };
  }

  const offered = normalizeCipherKey(rawKey);
  const expected = normalizeCipherKey(resolved.cipherKey);
  if (!offered || offered !== expected) {
    return { ok: false, error: "That cipher word does not open this tent's reading." };
  }

  const plaintext =
    lastVerdict.choice === "TRUTH"
      ? resolved.riddlePlaintextPlain
      : resolved.riddlePlaintextMirrored;

  if (!lastVerdict.riddleUnlocked) {
    await prisma.verdict.update({
      where: { id: lastVerdict.id },
      data: { riddleUnlocked: true },
    });
  }

  let advanced = false;
  let huntComplete = false;
  let clearedSuspectName: string | null = null;

  if (lastVerdict.wasCorrect) {
    // Advance only once, on successful unlock after a correct verdict.
    if (team.currentIndex === node.sequenceIndex) {
      const nextIndex = node.sequenceIndex + 1;
      await prisma.team.update({ where: { id: team.id }, data: { currentIndex: nextIndex } });
      advanced = true;
      huntComplete = nextIndex >= TOTAL_STORY_NODES;
    }
    if (resolved.clearReason && node.suspect) {
      clearedSuspectName = node.suspect.name;
    }
  }

  return {
    ok: true,
    data: { riddle: plaintext, advanced, huntComplete, clearedSuspectName },
  };
}

export async function updateTeamNote(
  teamCode: string,
  suspectId: string,
  note: string
): Promise<ActionResult<null>> {
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false, error: "Team not found." };

  await prisma.teamNote.upsert({
    where: { teamId_suspectId: { teamId: team.id, suspectId } },
    update: { note },
    create: { teamId: team.id, suspectId, note },
  });

  return { ok: true, data: null };
}

type AccusationResult = {
  wasCorrect: boolean;
  suspectCorrect: boolean;
  methodCorrect: boolean;
  factCorrect: boolean;
  murdererName: string;
  solutionText: string;
};

export async function submitAccusation(
  teamCode: string,
  suspectId: string,
  method: string,
  factKeyword: string,
  reasoning: string
): Promise<ActionResult<AccusationResult>> {
  const team = await prisma.team.findUnique({ where: { teamCode: teamCode.toUpperCase() } });
  if (!team) return { ok: false, error: "Team not found." };
  if (team.currentIndex < TOTAL_STORY_NODES) {
    return { ok: false, error: "Every tent must be resolved before the Accusation." };
  }

  const existing = await prisma.accusation.findUnique({ where: { teamId: team.id } });
  if (existing) return { ok: false, error: "Your accusation is already on record." };

  const suspect = await prisma.suspect.findUnique({ where: { id: suspectId } });
  if (!suspect) return { ok: false, error: "Name a suspect from the board." };
  if (!method.trim()) return { ok: false, error: "Name the method or weapon." };
  if (!factKeyword.trim()) {
    return { ok: false, error: "Choose the Case File fact that seals their guilt." };
  }
  if (!reasoning.trim()) return { ok: false, error: "Give one sentence of reasoning." };

  const cleared = await prisma.clearance.findFirst({
    where: { teamId: team.id, suspectId },
  });
  if (cleared) {
    return { ok: false, error: "That suspect has already been cleared — name who remains." };
  }

  const decoys = await loadDecoyRefs();
  const expectations = getAccusationExpectations(team.teamSeed, decoys);

  const suspectCorrect = suspect.isMurderer;
  const extractedMethod = extractMethodKeyword(method);
  const methodCorrect = extractedMethod !== null && expectations.methodKeywords.has(extractedMethod);
  const offeredFact = normalizeAccusationToken(factKeyword);
  const factCorrect = offeredFact === expectations.factKeyword;
  const wasCorrect = suspectCorrect;

  const murderer = await prisma.suspect.findFirst({ where: { isMurderer: true } });

  await prisma.accusation.create({
    data: {
      teamId: team.id,
      suspectId,
      methodSubmitted: method.trim(),
      factKeywordSubmitted: offeredFact,
      reasoning: reasoning.trim(),
      wasCorrect,
      suspectCorrect,
      methodCorrect,
      factCorrect,
    },
  });
  await prisma.team.update({
    where: { id: team.id },
    data: { status: "FINISHED", finishedAt: new Date() },
  });

  return {
    ok: true,
    data: {
      wasCorrect,
      suspectCorrect,
      methodCorrect,
      factCorrect,
      murdererName: murderer?.name ?? "Ostrin",
      solutionText: SOLUTION_TEXT,
    },
  };
}
