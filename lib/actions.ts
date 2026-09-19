"use server";

import { prisma } from "@/lib/db";
import { TOTAL_STORY_NODES } from "@/lib/state";
import { SOLUTION_TEXT } from "@/lib/solution";
import { verifySignedQrPayload } from "@/lib/qr-token";
import { checkRateLimit, checkMinInterval } from "@/lib/rate-limit";
import { deriveTeamSeed } from "@/lib/team-seed";
import { resolveNodeContent, type DecoyRef } from "@/lib/node-content";
import {
  getAccusationExpectations,
  extractMethodKeyword,
  normalizeAccusationToken,
} from "@/lib/node-content/accusation";
import { normalizeCipherKey } from "@/lib/node-content/riddle-cipher";
import { ensureClientContext, touchTeamDevice, flagFastResolve } from "@/lib/device-binding";
import { requireTeamByCode } from "@/lib/team-access";
import { getGameConfig } from "@/lib/admin-team-insight";
import { headers } from "next/headers";
import { customAlphabet } from "nanoid";

const DECOY_PENALTY_SECONDS = 5 * 60;
/** Extra time after 2 wrong verdicts at one node (tokens still greenfield). */
const ESCALATED_VERDICT_PENALTY_SECONDS = 10 * 60;
/** Min gap between scans of the same node (anti-spam). Client also submits only once per code. */
const SCAN_NODE_MIN_INTERVAL_MS = 8_000;
const VERDICT_RATE_LIMIT = { limit: 8, windowMs: 60_000 };
const JOIN_RATE_LIMIT = { limit: 10, windowMs: 60_000 };
const CREATE_RATE_LIMIT = { limit: 5, windowMs: 60_000 };

const MAX_TEAM_NAME = 80;
const MAX_MEMBER_NAME = 40;
const MAX_MEMBERS = 10;
const MAX_CONTACT = 80;
const MAX_NOTE = 2000;
const MAX_REASONING = 1000;
const MAX_METHOD = 120;

const codeDigits = customAlphabet("0123456789", 4);
const NAME_WORDS = /[A-Za-z]+/g;

const PAUSED_MSG = "The carnival is paused — wait for the organiser to resume.";

async function assertGameNotPaused(): Promise<string | null> {
  const config = await getGameConfig();
  return config.isPaused ? PAUSED_MSG : null;
}

async function clientRateKey(prefix: string): Promise<string> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  const ip = (forwarded ? forwarded.split(",")[0]?.trim() : null) || h.get("x-real-ip") || "unknown";
  return `${prefix}:${ip}`;
}

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

async function maybeFlagFastResolve(teamId: string, nodeId: string, minExpectedSeconds: number) {
  const firstScan = await prisma.scan.findFirst({
    where: { teamId, nodeId, wasValid: true },
    orderBy: { scannedAt: "asc" },
  });
  if (!firstScan) return;
  const elapsed = Math.floor((Date.now() - firstScan.scannedAt.getTime()) / 1000);
  await flagFastResolve(teamId, nodeId, elapsed, minExpectedSeconds);
}

export type ActionResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: string };

export async function createTeam(input: {
  name: string;
  members: string[];
  contact: string;
}): Promise<ActionResult<{ teamCode: string }>> {
  const createRate = checkRateLimit(await clientRateKey("create"), CREATE_RATE_LIMIT);
  if (!createRate.allowed) {
    return { ok: false, error: "Too many registrations — wait a moment." };
  }

  const name = input.name.trim().slice(0, MAX_TEAM_NAME);
  const members = input.members
    .map((m) => m.trim().slice(0, MAX_MEMBER_NAME))
    .filter(Boolean)
    .slice(0, MAX_MEMBERS);
  const contact = input.contact.trim().slice(0, MAX_CONTACT);

  if (!name) return { ok: false, error: "Give your team a name." };
  if (members.length === 0) return { ok: false, error: "Add at least one member." };
  if (!contact) return { ok: false, error: "A contact number is required." };

  let teamCode = generateTeamCode(name);
  for (let attempt = 0; attempt < 5; attempt++) {
    const clash = await prisma.team.findUnique({ where: { teamCode } });
    if (!clash) break;
    teamCode = generateTeamCode(name);
  }

  const team = await prisma.team.create({
    data: {
      teamCode,
      name,
      members: JSON.stringify(members),
      contact,
      teamSeed: deriveTeamSeed(teamCode),
      currentIndex: 0,
    },
  });

  const ctx = await ensureClientContext();
  await touchTeamDevice(team.id, ctx);

  return { ok: true, data: { teamCode } };
}

export async function joinTeam(teamCodeInput: string): Promise<ActionResult<{ teamCode: string }>> {
  const joinRate = checkRateLimit(await clientRateKey("join"), JOIN_RATE_LIMIT);
  if (!joinRate.allowed) {
    return { ok: false, error: "Too many attempts — wait a moment." };
  }

  const team = await requireTeamByCode(teamCodeInput.trim().slice(0, 32));
  if (!team) return { ok: false, error: "No team carries that code. Check with your Notebook holder." };

  const ctx = await ensureClientContext();
  await touchTeamDevice(team.id, ctx);

  return { ok: true, data: { teamCode: team.teamCode } };
}

type ScanResult =
  | { valid: true; kind: "story"; nodeId: string }
  | { valid: true; kind: "decoy"; passage: string; locationName: string }
  | { valid: false; reason: string };

/**
 * Evaluate a printed QR against (team, nodeSlot).
 * Stickers are multi-team reusable — never a globally spent token.
 * Story re-scan: same state, no double row. Decoy re-scan: same passage, no double penalty.
 */
export async function scanNode(teamCode: string, rawToken: string): Promise<ActionResult<ScanResult>> {
  const paused = await assertGameNotPaused();
  if (paused) return { ok: false, error: paused };

  const team = await requireTeamByCode(teamCode);
  if (!team) return { ok: false, error: "Team not found." };
  if (team.status === "FINISHED") return { ok: false, error: "This team has already finished the hunt." };

  const ctx = await ensureClientContext();
  await touchTeamDevice(team.id, ctx);

  const verified = verifySignedQrPayload(rawToken);
  if (!verified) {
    return {
      ok: true,
      data: { valid: false, reason: "That code doesn't match any tent in the fairground." },
    };
  }

  const node = await prisma.node.findFirst({
    where: { nodeSlot: verified.nodeSlot, token: verified.token },
  });
  if (!node) {
    return { ok: true, data: { valid: false, reason: "That code doesn't match any tent in the fairground." } };
  }

  const nodeCooldown = checkMinInterval(
    `scan-node:${team.id}:${node.id}`,
    SCAN_NODE_MIN_INTERVAL_MS
  );
  if (!nodeCooldown.allowed) {
    return {
      ok: true,
      data: {
        valid: false,
        reason: "Give that tent a moment — try again in a few seconds.",
      },
    };
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

    if (!lastVerdict!.riddleUnlocked) {
      await prisma.scan.create({
        data: { teamId: team.id, nodeId: node.id, wasValid: false, rejectionReason: "decoy-before-unlock" },
      });
      return {
        ok: true,
        data: {
          valid: false,
          reason: "Unlock the riddle first — then follow it to the dead end it names.",
        },
      };
    }

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
  escalatedPenalty: boolean;
};

export async function submitVerdict(
  teamCode: string,
  nodeId: string,
  choice: "TRUTH" | "LIE"
): Promise<ActionResult<VerdictResult>> {
  const paused = await assertGameNotPaused();
  if (paused) return { ok: false, error: paused };

  const team = await requireTeamByCode(teamCode);
  if (!team) return { ok: false, error: "Team not found." };

  const ctx = await ensureClientContext();
  await touchTeamDevice(team.id, ctx);

  const rate = checkRateLimit(`verdict:${team.id}`, VERDICT_RATE_LIMIT);
  if (!rate.allowed) {
    return { ok: false, error: "Too many verdict attempts — wait a moment." };
  }

  const node = await prisma.node.findUnique({ where: { id: nodeId }, include: { suspect: true } });
  if (!node) return { ok: false, error: "Testimony not found." };
  if (node.isDecoy) return { ok: false, error: "Testimony not found." };
  if (node.sequenceIndex !== team.currentIndex) {
    return { ok: false, error: "This testimony is no longer active for your team." };
  }

  const scan = await prisma.scan.findFirst({
    where: { teamId: team.id, nodeId: node.id, wasValid: true },
  });
  if (!scan) return { ok: false, error: "Scan the tent's code before rendering a verdict." };

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: node.id },
    orderBy: { submittedAt: "desc" },
  });
  if (lastVerdict?.wasCorrect) {
    return { ok: false, error: "Follow the riddle before you leave this tent." };
  }
  if (lastVerdict && !lastVerdict.wasCorrect) {
    if (!lastVerdict.riddleUnlocked) {
      return { ok: false, error: "Follow the riddle before you leave this tent." };
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

  const priorWrongs = await prisma.verdict.count({
    where: { teamId: team.id, nodeId: node.id, wasCorrect: false },
  });

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
  let escalatedPenalty = false;

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

    // Act I (no cipher): do not advance yet — keep the team on the riddle until
    // acknowledgeRiddle. Act II+ advances from unlockRiddle after the key.
  } else if (priorWrongs >= 2) {
    // 3rd+ wrong at this node: escalated time cost (token spend when Tokens ship).
    await prisma.team.update({
      where: { id: team.id },
      data: { penaltySeconds: { increment: ESCALATED_VERDICT_PENALTY_SECONDS } },
    });
    escalatedPenalty = true;
  }

  return {
    ok: true,
    data: {
      wasCorrect,
      // Act II+: withhold ciphertext until unlockRiddle returns plaintext.
      riddle: resolved.needsKey ? "" : riddle,
      clearedSuspectName,
      advanced: false,
      huntComplete: false,
      needsKey: resolved.needsKey,
      keyPrompt: resolved.keyPrompt,
      escalatedPenalty,
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
  const paused = await assertGameNotPaused();
  if (paused) return { ok: false, error: paused };

  const team = await requireTeamByCode(teamCode);
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
    if (team.currentIndex === node.sequenceIndex) {
      const nextIndex = node.sequenceIndex + 1;
      await prisma.team.update({ where: { id: team.id }, data: { currentIndex: nextIndex } });
      advanced = true;
      huntComplete = nextIndex >= TOTAL_STORY_NODES;
      await maybeFlagFastResolve(team.id, node.id, node.minExpectedSeconds);
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

/**
 * Act I: mark the post-verdict riddle as read, then advance on a correct judgment.
 * Act II+ wrong path: after unlock, this is a no-op if already unlocked.
 * Safe to call before navigating away from the riddle panel.
 */
export async function acknowledgeRiddle(
  teamCode: string,
  nodeId: string
): Promise<ActionResult<{ advanced: boolean; huntComplete: boolean }>> {
  const paused = await assertGameNotPaused();
  if (paused) return { ok: false, error: paused };

  const team = await requireTeamByCode(teamCode);
  if (!team) return { ok: false, error: "Team not found." };

  const node = await prisma.node.findUnique({ where: { id: nodeId } });
  if (!node || node.isDecoy) return { ok: false, error: "Riddle not found." };
  if (node.sequenceIndex !== team.currentIndex) {
    // Already advanced (e.g. Act II unlock) — treat as done.
    return { ok: true, data: { advanced: true, huntComplete: team.currentIndex >= TOTAL_STORY_NODES } };
  }

  const lastVerdict = await prisma.verdict.findFirst({
    where: { teamId: team.id, nodeId: node.id },
    orderBy: { submittedAt: "desc" },
  });
  if (!lastVerdict) {
    return { ok: false, error: "Render a verdict before leaving this tent." };
  }

  const resolved = await resolveForTeam(team.teamSeed, node.sequenceIndex);

  // Act II+ still needs the cipher unlock before acknowledge can advance.
  if (resolved.needsKey && !lastVerdict.riddleUnlocked) {
    return { ok: false, error: "Unlock the cipher before you leave this tent." };
  }

  if (!lastVerdict.riddleUnlocked) {
    await prisma.verdict.update({
      where: { id: lastVerdict.id },
      data: { riddleUnlocked: true },
    });
  }

  let advanced = false;
  let huntComplete = false;

  if (lastVerdict.wasCorrect && team.currentIndex === node.sequenceIndex) {
    const nextIndex = node.sequenceIndex + 1;
    await prisma.team.update({ where: { id: team.id }, data: { currentIndex: nextIndex } });
    advanced = true;
    huntComplete = nextIndex >= TOTAL_STORY_NODES;
    await maybeFlagFastResolve(team.id, node.id, node.minExpectedSeconds);
  }

  return { ok: true, data: { advanced, huntComplete } };
}

export async function updateTeamNote(
  teamCode: string,
  suspectId: string,
  note: string
): Promise<ActionResult<null>> {
  const team = await requireTeamByCode(teamCode);
  if (!team) return { ok: false, error: "Team not found." };

  const trimmed = note.slice(0, MAX_NOTE);

  await prisma.teamNote.upsert({
    where: { teamId_suspectId: { teamId: team.id, suspectId } },
    update: { note: trimmed },
    create: { teamId: team.id, suspectId, note: trimmed },
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
  const paused = await assertGameNotPaused();
  if (paused) return { ok: false, error: paused };

  const team = await requireTeamByCode(teamCode);
  if (!team) return { ok: false, error: "Team not found." };
  if (team.currentIndex < TOTAL_STORY_NODES) {
    return { ok: false, error: "Every tent must be resolved before the Accusation." };
  }

  const existing = await prisma.accusation.findUnique({ where: { teamId: team.id } });
  if (existing) return { ok: false, error: "Your accusation is already on record." };

  const suspect = await prisma.suspect.findUnique({ where: { id: suspectId } });
  if (!suspect) return { ok: false, error: "Name a suspect from the board." };
  const methodTrim = method.trim().slice(0, MAX_METHOD);
  const factTrim = factKeyword.trim().slice(0, 40);
  const reasoningTrim = reasoning.trim().slice(0, MAX_REASONING);
  if (!methodTrim) return { ok: false, error: "Name the method or weapon." };
  if (!factTrim) {
    return { ok: false, error: "Choose the Case File fact that seals their guilt." };
  }
  if (!reasoningTrim) return { ok: false, error: "Give one sentence of reasoning." };

  const cleared = await prisma.clearance.findFirst({
    where: { teamId: team.id, suspectId },
  });
  if (cleared) {
    return { ok: false, error: "That suspect has already been cleared — name who remains." };
  }

  const decoys = await loadDecoyRefs();
  const expectations = getAccusationExpectations(team.teamSeed, decoys);

  const suspectCorrect = suspect.isMurderer;
  const extractedMethod = extractMethodKeyword(methodTrim);
  const methodCorrect = extractedMethod !== null && expectations.methodKeywords.has(extractedMethod);
  const offeredFact = normalizeAccusationToken(factTrim);
  const factCorrect = offeredFact === expectations.factKeyword;
  const wasCorrect = suspectCorrect;

  const murderer = await prisma.suspect.findFirst({ where: { isMurderer: true } });

  await prisma.accusation.create({
    data: {
      teamId: team.id,
      suspectId,
      methodSubmitted: methodTrim,
      factKeywordSubmitted: offeredFact,
      reasoning: reasoningTrim,
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
      murdererName: murderer?.name ?? "Mr. Quill",
      solutionText: SOLUTION_TEXT,
    },
  };
}
