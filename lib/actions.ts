"use server";

import { prisma } from "@/lib/db";
import { TOTAL_STORY_NODES } from "@/lib/state";
import { SOLUTION_TEXT } from "@/lib/content";
import { verifySignedQrPayload } from "@/lib/qr-token";
import { checkRateLimit } from "@/lib/rate-limit";
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
    const servesCurrent =
      lastVerdict &&
      !lastVerdict.wasCorrect &&
      node.decoyForIndexes?.split(",").map(Number).includes(team.currentIndex);

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
        scannedAt: { gt: lastVerdict.submittedAt },
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
  if (node.sequenceIndex !== team.currentIndex) {
    return { ok: false, error: "This testimony is no longer active for your team." };
  }

  const scan = await prisma.scan.findFirst({ where: { teamId: team.id, nodeId: node.id, wasValid: true } });
  if (!scan) return { ok: false, error: "Scan the tent's code before rendering a verdict." };

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: node.id },
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
      return { ok: false, error: "Find the dead-end marker before you try this verdict again." };
    }
  }

  const wasCorrect = (choice === "TRUTH") === node.isTruthful;
  const riddle = choice === "TRUTH" ? node.riddlePlain : node.riddleMirrored;

  await prisma.verdict.create({
    data: { teamId: team.id, nodeId: node.id, choice, wasCorrect },
  });

  let clearedSuspectName: string | null = null;
  let advanced = false;
  let huntComplete = false;

  if (wasCorrect) {
    if (node.clearReason && node.suspectId) {
      const already = await prisma.clearance.findFirst({
        where: { teamId: team.id, suspectId: node.suspectId },
      });
      if (!already) {
        await prisma.clearance.create({
          data: {
            teamId: team.id,
            suspectId: node.suspectId,
            nodeId: node.id,
            reason: node.clearReason,
          },
        });
      }
      clearedSuspectName = node.suspect?.name ?? null;
    }

    const nextIndex = node.sequenceIndex + 1;
    await prisma.team.update({ where: { id: team.id }, data: { currentIndex: nextIndex } });
    advanced = true;
    huntComplete = nextIndex >= TOTAL_STORY_NODES;
  }

  return { ok: true, data: { wasCorrect, riddle, clearedSuspectName, advanced, huntComplete } };
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

type AccusationResult = { wasCorrect: boolean; murdererName: string; solutionText: string };

export async function submitAccusation(
  teamCode: string,
  suspectId: string,
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
  if (!reasoning.trim()) return { ok: false, error: "Give one sentence of reasoning." };

  const cleared = await prisma.clearance.findFirst({
    where: { teamId: team.id, suspectId },
  });
  if (cleared) {
    return { ok: false, error: "That suspect has already been cleared — name who remains." };
  }

  const wasCorrect = suspect.isMurderer;
  const murderer = await prisma.suspect.findFirst({ where: { isMurderer: true } });

  await prisma.accusation.create({
    data: { teamId: team.id, suspectId, reasoning: reasoning.trim(), wasCorrect },
  });
  await prisma.team.update({
    where: { id: team.id },
    data: { status: "FINISHED", finishedAt: new Date() },
  });

  return {
    ok: true,
    data: { wasCorrect, murdererName: murderer?.name ?? "Ostrin", solutionText: SOLUTION_TEXT },
  };
}
