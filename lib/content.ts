export const MARKS = [
  {
    title: "Mark I — The Rule of Three",
    body: "Honest carnival folk speak in triads: three objects, three actions, three sounds. A testimony that lists two, or four, or breaks its own rhythm mid-sentence, is false.",
  },
  {
    title: "Mark II — The Case File",
    body: "Any testimony contradicting the fixed facts below is false.",
  },
  {
    title: "Mark III — The Name",
    body: 'The troupe called him Orlan. Outsiders and pretenders say "the Ringmaster." A performer who won\'t use his name is performing.',
  },
  {
    title: "Mark IV — The Reckoning",
    body: "When a speaker ties their alibi to the night's clock, they must cite exactly three temporal anchors drawn from the Case File timeline. Each of the following counts as one anchor: the mist's settling (or \"when the mist settled\"), the drum's silence (or last honest hour / ten), the lantern circuit's death (or \"when the lanterns failed\"), Orlan's cracked watch at 10:18, or a clock time that correctly matches those events. Citing two or four such anchors is a lie. Inventing a time that contradicts the Case File also breaks Mark II.",
  },
] as const;

export const CASE_FACTS = [
  "Mist settled at 9:45 PM and never lifted.",
  "The lantern circuit failed at 10:30 PM; everything after that was hand-lamps.",
  "The east gate was barred at dusk and never opened.",
  "The parade drum rolled on the hour until 10:00, then fell quiet.",
  "Orlan's pocket watch crystal cracked at 10:18.",
] as const;

/** Accusation picker: keyword ↔ Case File line (server grades by keyword). */
export const CASE_FACT_OPTIONS = [
  { keyword: "MIST", label: CASE_FACTS[0] },
  { keyword: "LANTERN", label: CASE_FACTS[1] },
  { keyword: "EAST_GATE", label: CASE_FACTS[2] },
  { keyword: "DRUM", label: CASE_FACTS[3] },
  { keyword: "WATCH", label: CASE_FACTS[4] },
] as const;

export const PREMISE = `Ringmaster Orlan Vex is found dead beside the ticket wagon at 10:18 PM, the night before the carnival opens. Mist sits thick on the fairground. The east gate has been barred since dusk. Seven performers were inside the ropes. Every one of them has a story, and most of those stories are lies — but only one of them is lying about murder.`;
