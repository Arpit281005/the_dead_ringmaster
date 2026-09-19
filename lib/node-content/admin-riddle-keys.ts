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
    name: "Mr. Quill / Ticket Wagon (murderer — always truthful)",
    act: 1,
    steps:
      "Single-step only — no cipher key. Fixed-true; never clears. Emits Case Note cipher stamp TICKET for later tents. Accusation keystone seeded from his variant.",
    key: null,
    keySource: null,
    mirrorStyles: ["reversed", "negation"],
    example: null,
  },
  {
    sequenceIndex: 3,
    name: "Bahri / Fire Pit",
    act: 2,
    steps: "Keyed Caesar only — N = length(EMBER) = 5. Word woven into testimony; volunteer may confirm.",
    key: "EMBER",
    keySource: "volunteer_word",
    mirrorStyles: ["antonym", "directional"],
    example:
      "Plain riddle → Caesar+5 → stage1. Team shifts letters back by 5 with EMBER from the testimony.",
  },
  {
    sequenceIndex: 4,
    name: "Duran / Strongman's Ring",
    act: 2,
    steps: "Keyed Caesar only — N = length(SCAR) = 4. Key from Bahri Case Note stamp.",
    key: "SCAR",
    keySource: "earlier_node_fact:bahri_ember_scar",
    mirrorStyles: ["directional", "antonym"],
    example: "Case Note stamps SCAR after Bahri is judged correctly.",
  },
  {
    sequenceIndex: 5,
    name: "Twins / Trapeze Rig",
    act: 2,
    steps: "Keyed Caesar only — N = length(TICKET) = 6. Key from Quill Case Note stamp.",
    key: "TICKET",
    keySource: "earlier_node_fact:quill_east_barred",
    mirrorStyles: ["negation", "reversed"],
    example: "Case Note stamps TICKET after Quill is judged correctly.",
  },
  {
    sequenceIndex: 6,
    name: "Ostrin / Puppet Stage",
    act: 3,
    steps: "Keyed Caesar only — N = length(RESIN) = 5. Word woven into testimony; volunteer may confirm. Clearable red herring.",
    key: "RESIN",
    keySource: "volunteer_word",
    mirrorStyles: ["reversed", "directional"],
    example: "RESIN appears in Ostrin's testimony; volunteer may confirm.",
  },
  {
    sequenceIndex: 7,
    name: "Watchman / Physics Lab",
    act: 3,
    steps: "Keyed Caesar only — N = length(WOOD) = 4. Key from Ostrin Case Note stamp.",
    key: "WOOD",
    keySource: "earlier_node_fact:ostrin_resin_stage",
    mirrorStyles: ["antonym", "negation"],
    example: "Case Note stamps WOOD after Ostrin is judged correctly.",
  },
] as const;
