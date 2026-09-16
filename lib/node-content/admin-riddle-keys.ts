/**
 * ADMIN / VOLUNTEER ONLY — do not import from player routes.
 * Exact two-step riddle transforms for hand verification.
 *
 * Encode: plaintext → keyed Caesar (N = max(1, key.length % 26)) → mirror style → stage1
 * Decode: stage1 → inverse mirror → keyed Caesar reverse → plaintext
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
    steps: "Single-step only — no cipher key. Emits Case Note cipher CHAIN for later tents.",
    key: null,
    keySource: null,
    mirrorStyles: ["reversed", "negation"],
    example: null,
  },
  {
    sequenceIndex: 3,
    name: "Bahri / Fire Pit",
    act: 2,
    steps:
      "(1) Apply seeded mirror style ∈ {antonym, directional}. (2) Keyed Caesar N = length(CINDER) = 6.",
    key: "CINDER",
    keySource: "volunteer_word",
    mirrorStyles: ["antonym", "directional"],
    example:
      "Plain: Seek the chalk circle → Caesar+6 then antonym/directional → stage1. Volunteer speaks CINDER; team shifts letters back by 6 after undoing the mirror.",
  },
  {
    sequenceIndex: 4,
    name: "Duran / Strongman's Ring",
    act: 2,
    steps:
      "(1) Mirror ∈ {directional, antonym}. (2) Caesar N = length(BANDAGE) = 7. Key from Bahri Case Note.",
    key: "BANDAGE",
    keySource: "earlier_node_fact:bahri_pit_bandage",
    mirrorStyles: ["directional", "antonym"],
    example: "Case Note stamps BANDAGE after Bahri is judged correctly.",
  },
  {
    sequenceIndex: 5,
    name: "Twins / Trapeze Rig",
    act: 2,
    steps:
      "(1) Mirror ∈ {negation, reversed}. (2) Caesar N = length(CHAIN) = 5. Key from Quill Case Note.",
    key: "CHAIN",
    keySource: "earlier_node_fact:quill_gate_chained",
    mirrorStyles: ["negation", "reversed"],
    example: "Case Note stamps CHAIN after Quill is judged correctly.",
  },
  {
    sequenceIndex: 6,
    name: "Ostrin / Puppet Stage",
    act: 3,
    steps:
      "(1) Mirror ∈ {reversed, directional}. (2) Caesar N = length(STRING) = 6. Volunteer word.",
    key: "STRING",
    keySource: "volunteer_word",
    mirrorStyles: ["reversed", "directional"],
    example: "Volunteer at the puppet stage speaks STRING.",
  },
  {
    sequenceIndex: 7,
    name: "Watchman / West Gate",
    act: 3,
    steps:
      "(1) Mirror ∈ {antonym, negation}. (2) Caesar N = length(LAMP) = 4. Key from Ostrin Case Note.",
    key: "LAMP",
    keySource: "earlier_node_fact:ostrin_stage_lamp",
    mirrorStyles: ["antonym", "negation"],
    example: "Case Note stamps LAMP after Ostrin is judged correctly.",
  },
] as const;
