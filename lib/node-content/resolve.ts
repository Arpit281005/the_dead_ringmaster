import { seededRng } from "@/lib/seeded-rng";
import { getTemplate, STORY_TEMPLATES } from "./templates";
import { applyMirrorStyle, encodeStage1 } from "./riddle-cipher";
import type { DecoyRef, KeySource, ResolvedNodeContent } from "./types";

function resolveCipherKey(keySource: KeySource, volunteerWord?: string): string | null {
  if (!keySource) return null;
  if (keySource.type === "volunteer_word") {
    return volunteerWord?.toUpperCase() ?? null;
  }
  const emitter = STORY_TEMPLATES.find((t) => t.emitsFact?.key === keySource.factKey);
  return emitter?.emitsFact?.cipherKey?.toUpperCase() ?? null;
}

function keyPromptFor(keySource: KeySource): string | null {
  if (!keySource) return null;
  if (keySource.type === "volunteer_word") {
    return "Ask the tent volunteer for the cipher word.";
  }
  return "Use the cipher word stamped on your Case Notes.";
}

/**
 * Pure server-side resolver. Never import from Client Components.
 */
export function resolveNodeContent(
  sequenceIndex: number,
  teamSeed: string,
  decoysInPool: DecoyRef[]
): ResolvedNodeContent {
  const template = getTemplate(sequenceIndex);
  const rng = seededRng(teamSeed, sequenceIndex);

  if (decoysInPool.length === 0) {
    throw new Error(`No decoys in pool for sequenceIndex ${sequenceIndex}`);
  }

  const pool = decoysInPool.filter((d) => d.decoyPool === template.decoyPool);
  const decoyList = pool.length > 0 ? pool : decoysInPool;
  const decoy = rng.pick(decoyList);

  const policy = template.truthPolicy ?? "seeded";
  const isTruthful =
    policy === "fixed-true" ? true : policy === "fixed-false" ? false : rng.bool();

  const variant = isTruthful ? rng.pick(template.truthfulVariants) : rng.pick(template.lyingVariants);
  const brokenMark = isTruthful ? "NONE" : variant.mark;

  const testimonyText = template.testimonyFrame.replace("{{MARK_CLAUSE}}", variant.clause);

  const nextHint = rng.pick(template.nextHints);
  const decoyHintOptions = template.decoyHints[decoy.locationName] ?? [
    `Seek ${decoy.locationName} — a dead end dressed as a clue.`,
  ];
  const decoyHint = rng.pick(decoyHintOptions);
  const mirrorStyle = rng.pick(template.mirrorStyles);

  // Choice routing (plaintext): TRUTH choice shows riddlePlain; LIE shows riddleMirrored.
  // Correct choice always yields nextHint; wrong yields decoyHint.
  let plaintextPlain: string;
  let plaintextMirrored: string;
  if (isTruthful) {
    plaintextPlain = nextHint;
    plaintextMirrored = decoyHint;
  } else {
    plaintextPlain = decoyHint;
    plaintextMirrored = nextHint;
  }

  const needsKey = sequenceIndex >= 3 && template.keySource !== null;
  const cipherKey = needsKey
    ? resolveCipherKey(template.keySource, template.volunteerWord)
    : null;

  let riddlePlain: string;
  let riddleMirrored: string;

  if (needsKey && cipherKey) {
    // Act II+: both branches are stage1 = mirror(keyedObfuscate(plaintext))
    riddlePlain = encodeStage1(plaintextPlain, cipherKey, mirrorStyle);
    riddleMirrored = encodeStage1(plaintextMirrored, cipherKey, mirrorStyle);
  } else {
    // Act I: plain as-is; mirrored branch applies mirror style to its plaintext payload
    riddlePlain = plaintextPlain;
    riddleMirrored = applyMirrorStyle(plaintextMirrored, mirrorStyle);
  }

  return {
    sequenceIndex,
    isTruthful,
    brokenMark,
    testimonyText,
    riddlePlain,
    riddleMirrored,
    riddlePlaintextPlain: plaintextPlain,
    riddlePlaintextMirrored: plaintextMirrored,
    mirrorStyle,
    clearReason: template.clearReason,
    decoyNodeId: decoy.id,
    decoyLocationName: decoy.locationName,
    dependsOnFactKeys: template.dependsOnFactKeys,
    emitsFact: template.emitsFact,
    needsKey,
    keySource: template.keySource,
    cipherKey,
    keyPrompt: keyPromptFor(template.keySource),
  };
}

/** Look up the expected cipher key for a node (server unlock / admin). */
export function getExpectedCipherKey(sequenceIndex: number): string | null {
  const template = getTemplate(sequenceIndex);
  return resolveCipherKey(template.keySource, template.volunteerWord);
}
