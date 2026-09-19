export type BrokenMark = "NONE" | "THREE" | "CASEFILE" | "NAME" | "RECKONING";
export type MirrorStyle = "directional" | "negation" | "reversed" | "antonym";
export type TruthPolicy = "seeded" | "fixed-true" | "fixed-false";

export type DecoyPoolId = "act1" | "act2" | "act3";

export type MarkVariant = {
  mark: BrokenMark;
  /** Clause that plugs into the testimony frame (Mark-breaking when mark !== NONE). */
  clause: string;
  /**
   * Murderer / accusation sources: Case File keystone keyword the team
   * must cite at Accusation. Seeded with the variant; never sent to clients.
   */
  accusationFactKeyword?: string;
};

export type EmittedFact = {
  key: string;
  text: string;
  /** Short uppercase token stamped on Case Notes for Act II+ riddle unlock. */
  cipherKey?: string;
};

export type KeySource =
  | null
  | { type: "volunteer_word" }
  | { type: "earlier_node_fact"; factKey: string };

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
  /** Fact keys that must already exist on the team's board before a verdict is accepted. */
  dependsOnFactKeys: string[];
  /** Written to TeamFact on a correct verdict. */
  emitsFact: EmittedFact | null;
  /** Act III specials may fix truth; default seeded. */
  truthPolicy?: TruthPolicy;
  /** Act I: null. Act II+: volunteer word or earlier Case Note cipher key. */
  keySource: KeySource;
  /** Server-only volunteer word when keySource.type === volunteer_word. */
  volunteerWord?: string;
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
  /** Final plaintext (Act I) or stage1 cipher (Act II+). */
  riddlePlain: string;
  riddleMirrored: string;
  /** Plaintext next/decoy before Act II+ encoding — server unlock only. */
  riddlePlaintextPlain: string;
  riddlePlaintextMirrored: string;
  mirrorStyle: MirrorStyle;
  clearReason: string | null;
  decoyNodeId: string;
  decoyLocationName: string;
  dependsOnFactKeys: string[];
  emitsFact: EmittedFact | null;
  needsKey: boolean;
  keySource: KeySource;
  /** Resolved key string for encode/verify — never send to client. */
  cipherKey: string | null;
  keyPrompt: string | null;
  /** Seeded Case File keystone for Accusation — murderer variants; server-only. */
  accusationFactKeyword: string | null;
};
