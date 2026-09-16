import { seededRng } from "@/lib/seeded-rng";
import { getTemplate } from "./templates";
import type { DecoyRef, MirrorStyle, ResolvedNodeContent } from "./types";

function applyMirrorStyle(text: string, style: MirrorStyle): string {
  switch (style) {
    case "reversed":
      return text.split(/\s+/).reverse().join(" ");
    case "directional":
      return text
        .replace(/\beast\b/gi, "⟦W⟧")
        .replace(/\bwest\b/gi, "east")
        .replace(/⟦W⟧/g, "west")
        .replace(/\bnorth\b/gi, "⟦S⟧")
        .replace(/\bsouth\b/gi, "north")
        .replace(/⟦S⟧/g, "south")
        .replace(/\bhighest\b/gi, "⟦L⟧")
        .replace(/\blowest\b/gi, "highest")
        .replace(/⟦L⟧/g, "lowest");
    case "negation":
      return text
        .replace(/\bwhere\b/gi, "where no")
        .replace(/\bfind\b/gi, "do not find")
        .replace(/\bseek\b/gi, "do not seek");
    case "antonym":
      return text
        .replace(/\bbrightest\b/gi, "⟦D⟧")
        .replace(/\bdimmest\b/gi, "brightest")
        .replace(/⟦D⟧/g, "dimmest")
        .replace(/\bemptiest\b/gi, "⟦F⟧")
        .replace(/\bfullest\b/gi, "emptiest")
        .replace(/⟦F⟧/g, "fullest")
        .replace(/\bhighest\b/gi, "⟦L⟧")
        .replace(/\blowest\b/gi, "highest")
        .replace(/⟦L⟧/g, "lowest");
    default:
      return text;
  }
}

/**
 * Pure server-side resolver. Never import from Client Components.
 * `isTruthful`, Mark detail, riddles, and decoy selection all depend on teamSeed
 * (unless truthPolicy fixes Act III specials).
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

  let riddlePlain: string;
  let riddleMirrored: string;
  if (isTruthful) {
    riddlePlain = nextHint;
    riddleMirrored = applyMirrorStyle(decoyHint, mirrorStyle);
  } else {
    riddlePlain = decoyHint;
    riddleMirrored = applyMirrorStyle(nextHint, mirrorStyle);
  }

  return {
    sequenceIndex,
    isTruthful,
    brokenMark,
    testimonyText,
    riddlePlain,
    riddleMirrored,
    mirrorStyle,
    clearReason: template.clearReason,
    decoyNodeId: decoy.id,
    decoyLocationName: decoy.locationName,
    dependsOnFactKeys: template.dependsOnFactKeys,
    emitsFact: template.emitsFact,
  };
}
