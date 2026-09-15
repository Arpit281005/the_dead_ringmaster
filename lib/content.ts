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
] as const;

export const CASE_FACTS = [
  "Rain began at 10:40 PM and did not stop.",
  "The generator failed at 11:20 PM; everything after that was lamplight.",
  "The west gate was chained at dusk and never opened.",
  "The carousel bell rang on the hour until 11:00, then fell silent.",
  "Orlan's pocket watch stopped at 11:11.",
] as const;

export const PREMISE = `Ringmaster Orlan Vex is found dead beneath the big top at 11:11 PM, the night before the carnival opens. The carousel is still turning when they find him. The west gate has been chained since dusk. Seven performers were inside the fairground. Every one of them has a story, and most of those stories are lies — but only one of them is lying about murder.`;

export const SOLUTION_TEXT = `Ostrin the Puppeteer strung more than wood that night. When the bell fell silent and the generator gave out, he led Orlan behind the curtain with a promise to show him "a face too honest for a liar's trade" — and closed his hands around the one throat in the fairground that could have exposed him. The rain washed the yard clean. The chained gate kept the world out and the truth in. Every testimony that seemed to clear him was true by the letter of the Marks — he never broke rhythm, never touched the case file, never mispronounced a name — because a puppeteer's gift was never lying. It was making the truth perform.`;
