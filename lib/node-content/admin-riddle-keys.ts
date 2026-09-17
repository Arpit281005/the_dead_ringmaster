/**
 * ADMIN / VOLUNTEER ONLY — do not import from player routes.
 * Exact riddle transforms for hand verification.
 *
 * Act I wrong-path: mirror style only (no cipher).
 * Act II+: stage1 = keyed Caesar only (N = max(1, key.length % 26)); no mirror on ciphertext.
 * Decode: stage1 → keyed Caesar reverse → plaintext.
 */

export const ADMIN_RIDDLE_KEYS = [
  {
    sequenceIndex: 0,
    name: "Madame Vireya / Divination Tent",
    act: 1,
    steps: "Single-step only — no cipher key. Verdict reveals the final riddle.",
    key: null,
    keySource: null,
    mirrorStyles: ["directional", "negation"],
    example: null,
  },
  {
    sequenceIndex: 1,
    name: "Kalo / Painted Booth",
    act: 1,
    steps: "Single-step only — no cipher key.",
    key: null,
    keySource: null,
    mirrorStyles: ["negation", "directional"],
    example: null,
  },
  {
    sequenceIndex: 2,
    name: "Mr. Quill / Ticket Wagon",
    act: 1,
    steps: "Single-step only — no cipher key. Emits Case Note cipher stamp CHAIN for later tents.",
    key: null,
    keySource: null,
    mirrorStyles: ["reversed", "negation"],
    example: null,
  },
  {
    sequenceIndex: 3,
    name: "Bahri / Fire Pit",
    act: 2,
    steps: "Keyed Caesar only — N = length(CINDER) = 6. Word woven into testimony; volunteer may confirm.",
    key: "CINDER",
    keySource: "volunteer_word",
    mirrorStyles: ["antonym", "directional"],
    example:
      "Plain riddle → Caesar+6 → stage1. Team shifts letters back by 6 with CINDER from the testimony.",
  },
  {
    sequenceIndex: 4,
    name: "Duran / Strongman's Ring",
    act: 2,
    steps: "Keyed Caesar only — N = length(BANDAGE) = 7. Key from Bahri Case Note stamp.",
    key: "BANDAGE",
    keySource: "earlier_node_fact:bahri_pit_bandage",
    mirrorStyles: ["directional", "antonym"],
    example: "Case Note stamps BANDAGE after Bahri is judged correctly.",
  },
  {
    sequenceIndex: 5,
    name: "Twins / Trapeze Rig",
    act: 2,
    steps: "Keyed Caesar only — N = length(CHAIN) = 5. Key from Quill Case Note stamp.",
    key: "CHAIN",
    keySource: "earlier_node_fact:quill_gate_chained",
    mirrorStyles: ["negation", "reversed"],
    example: "Case Note stamps CHAIN after Quill is judged correctly.",
  },
  {
    sequenceIndex: 6,
    name: "Ostrin / Puppet Stage",
    act: 3,
    steps: "Keyed Caesar only — N = length(STRING) = 6. Word woven into testimony; volunteer may confirm.",
    key: "STRING",
    keySource: "volunteer_word",
    mirrorStyles: ["reversed", "directional"],
    example: "STRING appears in Ostrin's testimony; volunteer may confirm.",
  },
  {
    sequenceIndex: 7,
    name: "Watchman / West Gate",
    act: 3,
    steps: "Keyed Caesar only — N = length(LAMP) = 4. Key from Ostrin Case Note stamp.",
    key: "LAMP",
    keySource: "earlier_node_fact:ostrin_stage_lamp",
    mirrorStyles: ["antonym", "negation"],
    example: "Case Note stamps LAMP after Ostrin is judged correctly.",
  },
] as const;
