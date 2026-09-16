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
    body: "When a speaker ties their alibi to the night's clock, they must cite exactly three temporal anchors drawn from the Case File timeline. Each of the following counts as one anchor: the rain's beginning (or \"when the rain began\"), the bell's silence (or last honest hour / eleven), the generator's death (or \"when the generator failed\"), Orlan's watch at 11:11, or a clock time that correctly matches those events. Citing two or four such anchors is a lie. Inventing a time that contradicts the Case File also breaks Mark II.",
  },
] as const;

export const CASE_FACTS = [
  "Rain began at 10:40 PM and did not stop.",
  "The generator failed at 11:20 PM; everything after that was lamplight.",
  "The west gate was chained at dusk and never opened.",
  "The carousel bell rang on the hour until 11:00, then fell silent.",
  "Orlan's pocket watch stopped at 11:11.",
] as const;

/** Accusation picker: keyword ↔ Case File line (server grades by keyword). */
export const CASE_FACT_OPTIONS = [
  { keyword: "RAIN", label: CASE_FACTS[0] },
  { keyword: "GENERATOR", label: CASE_FACTS[1] },
  { keyword: "WEST_GATE", label: CASE_FACTS[2] },
  { keyword: "BELL", label: CASE_FACTS[3] },
  { keyword: "WATCH", label: CASE_FACTS[4] },
] as const;

export const PREMISE = `Ringmaster Orlan Vex is found dead beneath the big top at 11:11 PM, the night before the carnival opens. The carousel is still turning when they find him. The west gate has been chained since dusk. Seven performers were inside the fairground. Every one of them has a story, and most of those stories are lies — but only one of them is lying about murder.`;
