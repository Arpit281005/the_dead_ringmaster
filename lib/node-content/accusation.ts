import { CASE_FACT_OPTIONS } from "@/lib/content";
import { resolveNodeContent } from "./resolve";
import type { DecoyRef } from "./types";

/** Quill node — accusation keystone is seeded with his truthful variant. */
export const ACCUSATION_NODE_INDEX = 2;

/** Accepted method/weapon tokens (queue rope around the throat). */
export const METHOD_KEYWORDS = new Set([
  "ROPE",
  "CORD",
  "QUEUE",
  "QUEUEROPE",
  "TICKETROPE",
  "STRANGLE",
  "STRANGLED",
  "STRANGLING",
  "STRANGULATION",
  "THROAT",
  "NOOSE",
]);

export { CASE_FACT_OPTIONS };

export function normalizeAccusationToken(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z]/g, "");
}

/** Extract first matching method keyword from free text (e.g. "by the rope"). */
export function extractMethodKeyword(raw: string): string | null {
  const normalized = normalizeAccusationToken(raw);
  if (!normalized) return null;
  if (METHOD_KEYWORDS.has(normalized)) return normalized;
  const ordered = [...METHOD_KEYWORDS].sort((a, b) => b.length - a.length);
  for (const kw of ordered) {
    if (normalized.includes(kw)) return kw;
  }
  return null;
}

export function labelForFactKeyword(keyword: string): string | null {
  const normalized = normalizeAccusationToken(keyword);
  const hit = CASE_FACT_OPTIONS.find(
    (o) => normalizeAccusationToken(o.keyword) === normalized
  );
  return hit?.label ?? null;
}

/**
 * Server-only: expected Case File keystone for this team's seeded Quill variant.
 * Must use the same decoy list as other resolve calls so RNG stays aligned.
 */
export function getAccusationExpectations(teamSeed: string, decoysInPool: DecoyRef[]) {
  const resolved = resolveNodeContent(ACCUSATION_NODE_INDEX, teamSeed, decoysInPool);
  const factKeyword = resolved.accusationFactKeyword;
  if (!factKeyword) {
    throw new Error("Quill template missing accusationFactKeyword on resolved variant");
  }
  return {
    factKeyword: normalizeAccusationToken(factKeyword),
    methodKeywords: METHOD_KEYWORDS,
  };
}
