export type BrokenMark = "NONE" | "THREE" | "CASEFILE" | "NAME";
export type MirrorStyle = "directional" | "negation" | "reversed" | "antonym";

export type DecoyPoolId = "act1" | "act2" | "act3";

export type MarkVariant = {
  mark: BrokenMark;
  /** Clause that plugs into the testimony frame (Mark-breaking when mark !== NONE). */
  clause: string;
};

export type StoryNodeTemplate = {
  sequenceIndex: number;
  decoyPool: DecoyPoolId;
  /** Prose with {{MARK_CLAUSE}} placeholder for the seeded Mark-bearing detail. */
  testimonyFrame: string;
  truthfulVariants: MarkVariant[];
  lyingVariants: MarkVariant[];
  /** Hint fragments that point to the next story tent (correct path). */
  nextHints: string[];
  /** Hint fragments keyed by decoy locationName (wrong path). */
  decoyHints: Record<string, string[]>;
  mirrorStyles: MirrorStyle[];
  clearReason: string | null;
};

export type DecoyRef = {
  id: string;
  locationName: string;
  decoyPool: string;
};

export type ResolvedNodeContent = {
  sequenceIndex: number;
  isTruthful: boolean;
  brokenMark: BrokenMark;
  testimonyText: string;
  riddlePlain: string;
  riddleMirrored: string;
  mirrorStyle: MirrorStyle;
  clearReason: string | null;
  decoyNodeId: string;
  decoyLocationName: string;
};
