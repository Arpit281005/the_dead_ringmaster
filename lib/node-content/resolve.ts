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
    return "Find the cipher word in this testimony (or ask the tent volunteer).";
  }
  return "Find the cipher stamp on your Case Notes from an earlier tent.";
}

/**
 * Pure server-side resolver. Never import from Client Components.
 *
 * RNG contract: salt "truth" is only for isTruthful (when seeded).
 * Salt "default" is for decoy / variant / hint / mirror picks — do not insert
 * calls before bool on the truth stream.
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
    policy === "fixed-true"
      ? true
      : policy === "fixed-false"
        ? false
        : seededRng(teamSeed, sequenceIndex, "truth").bool();

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
    // Act II+: Caesar only — easy to hand-decode once the key is known.
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
    accusationFactKeyword: variant.accusationFactKeyword?.toUpperCase() ?? null,
  };
}

/** Look up the expected cipher key for a node (server unlock / admin). */
export function getExpectedCipherKey(sequenceIndex: number): string | null {
  const template = getTemplate(sequenceIndex);
  return resolveCipherKey(template.keySource, template.volunteerWord);
}
