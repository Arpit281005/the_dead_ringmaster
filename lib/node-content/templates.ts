import type { StoryNodeTemplate } from "./types";

/**
 * Narrative templates for per-team resolution.
 * Location/suspect identity still lives on DB Node rows; solvable content is computed here.
 * Act I (0–2): difficulty unchanged — only silent emitsFact on Quill for later deps.
 * Second-run prose: new Case File timeline (mist / drum / lanterns / east gate / 10:18).
 */
export const STORY_TEMPLATES: StoryNodeTemplate[] = [
  {
    sequenceIndex: 0,
    decoyPool: "act1",
    dependsOnFactKeys: [],
    emitsFact: null,
    keySource: null,
    testimonyFrame: `They will tell you I trade futures for coin. Perhaps. But I read Orlan's palm three autumns running, and I will swear to what I know. {{MARK_CLAUSE}} I heard no quarrel at the ticket wagon, saw no shadow cross the barred east gate — how could I, barred as it was since dusk? Orlan mocked my cards last week, called them smoke and theatre, and I forgave him for it. I did not love him. I did not kill him either. Ask the mist. Ask the drum. Ask the quiet after ten.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "Three things hold: the mist, the drum, and the watch that cracked at his wrist. I was in this tent when the mist settled, shuffling cards, trimming wicks, and waiting for a client who never came. The drum rolled its last honest hour at ten. I stayed with wax and cards under my own hand-lamp after that — no fourth clock-bite to invent.",
      },
      {
        mark: "NONE",
        clause:
          "I keep three certainties: mist that settled at forty-five past nine, the last honest drum at ten, and the watch cracked at his wrist. I stayed in this tent after the mist settled — cutting cards, stacking coins for readings, and listening to canvas breathe — while the east gate stayed barred as it had since dusk.",
      },
      {
        mark: "NONE",
        clause:
          "Ask me three times and I answer the same: mist, drum, lanterns. I shuffled cards and trimmed wicks when the mist settled; the drum's last honest hour found me still waiting; after the lanterns failed at half past ten I worked by hand-lamp alone.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I will swear to four things I know: the mist, the drum, the watch that cracked at his wrist, and the lantern I never lit. I was in this tent when the mist settled, shuffling cards and waiting — rhythm broken, count wrong.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I was in this tent when the mist settled, shuffling cards, trimming wicks, waiting. The east gate opened once for a late client — I saw the bar lifted myself — and then the mist, the drum, and the watch that cracked.",
      },
      {
        mark: "NAME",
        clause:
          "I read the Ringmaster's hand three autumns running. I was in this tent when the mist settled, shuffling cards, trimming wicks, and waiting for a client who never came. The drum rolled its last honest hour at ten.",
      },
    ],
    nextHints: [
      "Where faces freeze for strangers and smiles are rented by the second — seek the spot built for the camera, not the queue.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Cold metal, a drip, a plastic cup that never empties the same way twice. Thirst stops here between classes.",
      ],
      "The Prop Wagon": [
        "Ink and arrows claiming to know every path. Stand where the lost unfold paper before they walk.",
      ],
      "The Rain Barrel Court": [
        "Oil, torque, and unfinished engines. Find the room that teaches metal how to move.",
      ],
    },
    mirrorStyles: ["directional", "negation"],
    clearReason:
      "Cleared — the mist, the cards, the quiet after the drum all hold; her tent never emptied that night.",
  },
  {
    sequenceIndex: 1,
    decoyPool: "act1",
    dependsOnFactKeys: [],
    emitsFact: null,
    keySource: null,
    testimonyFrame: `Paint doesn't lie, they say, but paint is the only thing about me that's honest. {{MARK_CLAUSE}} I laughed too. That was the last time I saw him breathing. The drum rolled its hours, the mist fell, the east gate stayed barred — I know because I checked it myself, twice, out of nothing but habit. When the lanterns failed I worked by hand-lamp and kept painting, because a painted man without his face is just a man, and I could not bear to be just a man that night. I did not go near the ticket wagon. Ask anyone. Ask no one. It hardly matters which.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black — three bowls and no more, layering my face until it wasn't mine anymore. Orlan came by before the mist, laughed at my nose, said I looked like a bruise that never healed.",
      },
      {
        mark: "NONE",
        clause:
          "I stayed at the mirror: white, red, and black in triad, never a fourth. The paint dried between the mist's settling and the lanterns' death. Orlan came by before the mist and laughed at the face that wasn't mine.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black, mixing gold, layering my face until it wasn't mine anymore. Orlan came by before the mist, laughed at my nose, said I looked like a bruise that never healed.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black — three bowls. After the mist I walked the east gate and found it open a crack, then painted on. Orlan had already come by before the mist.",
      },
      {
        mark: "NAME",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black. The Ringmaster came by before the mist, laughed at my nose, said I looked like a bruise that never healed.",
      },
    ],
    nextHints: [
      "Where silence is shelved in rows and knowledge waits behind a door you push with care — follow the hush, not the crowd.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Cold metal, a drip, a plastic cup that never empties the same way twice. Thirst stops here between classes.",
      ],
      "The Prop Wagon": [
        "Ink and arrows claiming to know every path. Stand where the lost unfold paper before they walk.",
      ],
      "The Rain Barrel Court": [
        "Oil, torque, and unfinished engines. Find the room that teaches metal how to move.",
      ],
    },
    mirrorStyles: ["negation", "directional"],
    clearReason:
      "Cleared — the greasepaint tells the truth even where his rhythm doesn't; he never left the booth.",
  },
  {
    sequenceIndex: 2,
    decoyPool: "act1",
    dependsOnFactKeys: [],
    truthPolicy: "fixed-true",
    emitsFact: {
      key: "quill_east_barred",
      text: "The east gate stayed barred from dusk; Quill never lifted the bar. Cipher stamp: TICKET.",
      cipherKey: "TICKET",
    },
    keySource: null,
    // Murderer: always truthful; accusation keystone seeded per team.
    testimonyFrame: `{{MARK_CLAUSE}}`,
    truthfulVariants: [
      {
        mark: "NONE",
        accusationFactKeyword: "EAST_GATE",
        clause: `I counted them in — three by three, family by family, laugh by laugh — one hundred and sixty-two souls past my rope before the mist settled. I have never lost count in eleven years and I did not lose it that night. The east gate stayed barred from dusk; I never touched the bar. I sat with the coin box under hand-lamp after the lanterns failed. Orlan trusted me with the takings and I have never once shorted him a shilling — so I will swear. I saw the Painted Man cross the yard, I saw the twins arguing by their rig, I saw nothing of murder in any of it. The mist did not frighten me. The dark did not frighten me. Only the silence after, when the drum would not roll and no one would tell me why, frightened me enough to sit down on my own ticket stool and wait for someone braver than I am to go and look. Remember the word stamped on every stub I tear: TICKET — it is how the night keeps score.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "MIST",
        clause: `Three duties: count, bar, wait. The east gate never opened. The mist settled on schedule. Orlan's watch, they say, cracked at ten-eighteen — I was nowhere near it. I counted them in until the mist, then sat with the coin box. I saw no quarrel worth reporting. The parade drum had already gone quiet when I trimmed the lamp wick. On every stub I tear, the carnival prints one word in bold: TICKET — keep that stamp; nights like this lose track of paper.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "DRUM",
        clause: `I counted by threes until the mist, then sat. Three anchors only: mist settling, the drum's last honest hour at ten, and the lanterns failing at half past — after that I kept the stool by hand-lamp. The east gate stayed barred; my counting did not falter. Orlan trusted me with the coin box. I never lifted the east bar. If you need a cipher later, take the word from my trade itself — TICKET — printed on every stub I tear.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "LANTERN",
        clause: `I counted them in — three by three — before the mist, then kept the stool when the lanterns failed at half past ten. Hand-lamps only after that. The east gate stayed barred from dusk. The drum had already gone quiet at ten while I tore stubs at this same wagon. I never shorted the box. On the stubs: one stamp, always the same — TICKET — so the ledger and the night agree.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "WATCH",
        clause: `Three anchors I will not bend: the mist settled; the drum went quiet at ten; they say his watch cracked at ten-eighteen while I was still tearing stubs at this wagon. The east gate stayed barred. I did not leave the stool. Stamp this for later: TICKET — the word my trade lives by.`,
      },
    ],
    lyingVariants: [],
    nextHints: [
      "Open chalk, open sky, and the sound of someone else's whistle — where speed is measured in lanes, not pages.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Cold metal, a drip, a plastic cup that never empties the same way twice. Thirst stops here between classes.",
      ],
      "The Prop Wagon": [
        "Ink and arrows claiming to know every path. Stand where the lost unfold paper before they walk.",
      ],
      "The Rain Barrel Court": [
        "Oil, torque, and unfinished engines. Find the room that teaches metal how to move.",
      ],
    },
    mirrorStyles: ["reversed", "negation"],
    clearReason: null,
  },
  // —— Act II ——
  {
    sequenceIndex: 3,
    decoyPool: "act2",
    dependsOnFactKeys: [],
    emitsFact: {
      key: "bahri_ember_scar",
      text: "Bahri's hands were scarred from burns; he worked the fire pit from the mist through the lanterns' death. Cipher stamp: SCAR.",
      cipherKey: "SCAR",
    },
    keySource: { type: "volunteer_word" },
    volunteerWord: "EMBER",
    testimonyFrame: `Fire forgives nothing, and it has never forgiven me — look at my hands, wrapped twice over since Tuesday, and ask if a man like that could have gripped a rope, a blade, a throat. Every ember that kissed my palms is still there under the cloth. {{MARK_CLAUSE}} I liked Orlan well enough, though he never paid what he owed. We spoke of debts once, briefly, and I told him fire doesn't care who's rich. He laughed at that. I did not go near the ticket wagon, did not hear the drum stop rolling, did not see anyone near the east gate, barred as it was. Believe me or don't. My hands can't lie even if I wanted them to.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was practising when the mist settled: swallow, breathe, swallow again — three long pulls of flame that lit the yard blue. The drum rolled its last true hour and I kept working. After the lanterns died I worked by hand-lamp, same as always, same as every night this fortnight. Say the word with me if you must unlock a later riddle: EMBER — it lives under every wrap.",
      },
      {
        mark: "NONE",
        clause:
          "Three anchors only: when the mist settled I was already at the pit; the drum's last honest hour found me still swallowing flame; when the lanterns failed I switched to hand-lamp and did not leave. The cloth hides a truth you can taste: EMBER — keep that word for the cipher ahead.",
      },
    ],
    lyingVariants: [
      {
        mark: "RECKONING",
        clause:
          "I was practising from half past nine: swallow, breathe, swallow again — three long pulls of flame. When the mist settled I did not stop. After the lanterns died I worked by hand-lamp, same as always — two true clock-bites only; the parade hour never registered for me. An EMBER under the wrap still burns.",
      },
      {
        mark: "RECKONING",
        clause:
          "I worked the pit when the mist settled and again after the lanterns died — two clock-bites and no more, because a burned man counts what hurts and forgets the parade hour. The cloth still smells of EMBER.",
      },
    ],
    nextHints: [
      "Screens glow colder than any carnival lamp. Find the room where keyboards click and problems compile.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "Trays, steam, and a queue that never quite ends. Follow the smell of spice, not the sound of study.",
      ],
      "The Sawdust Heap": [
        "Lined metal bodies waiting for drivers who already left. Stand where engines sleep in numbered rows.",
      ],
      "The Broken Calliope": [
        "Desks that have heard four years of the same excuses. Those closest to leaving know this room by heart.",
      ],
    },
    mirrorStyles: ["antonym", "directional"],
    clearReason:
      "Cleared — his hands could not have done it; the fire pit held him through the lanterns' death.",
  },
  {
    sequenceIndex: 4,
    decoyPool: "act2",
    dependsOnFactKeys: ["bahri_ember_scar"],
    emitsFact: {
      key: "duran_yard_shape",
      text: "A wrapped figure was seen at the equipment yard after the drum died; Bahri was not that figure.",
    },
    keySource: { type: "earlier_node_fact", factKey: "bahri_ember_scar" },
    testimonyFrame: `Strength is a slow thing, people forget that. I do not move quick, I move certain — one lift, one plant, one hold, and the crowd forgets to breathe. {{MARK_CLAUSE}} Orlan came by once, asked if I'd lift the new frame myself and save him a labourer's wage. I said I would, for a fair cut. He laughed and walked off toward the ticket wagon, and that's the last true thing I know of him — walking, laughing, alive. I stayed with my ropes till the shouting started.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "Three anchors under the awning: when the mist settled I was oiling the rigging; the drum's last honest hour found me still coiling rope; when the lanterns failed I tested the frame by hand-lamp and did not leave. Same three chores I do every night before a show. After the drum had already gone quiet I did see a shape near the equipment yard, hands wrapped white — didn't think much of it, and it was not the fire-eater's walk.",
      },
      {
        mark: "NONE",
        clause:
          "Three chores, three anchors: oil when the mist came, coil through the drum's last hour, test after the lanterns died. Under the awning the whole time. After the drum died I glimpsed a wrapped shape by the equipment yard — not Bahri's gait, not the pit's man — then returned to the ropes.",
      },
    ],
    lyingVariants: [
      {
        mark: "CASEFILE",
        clause:
          "That night I was oiling the rigging, coiling the rope, testing the frame — same three chores. The mist came. After the drum died I saw Bahri by the equipment yard, hands wrapped white — and I swear the east gate stood open a crack behind him, clear as hand-lamp, though every Case File says it stayed barred.",
      },
      {
        mark: "THREE",
        clause:
          "I oiled, coiled, tested, and counted the weights — four chores. After the drum died I swore I saw Bahri wrapped at the equipment yard, clear as hand-lamp.",
      },
    ],
    nextHints: [
      "Where plates stack louder than applause and dinner finds you before you find a seat — follow steam, not spectacle.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "Trays, steam, and a queue that never quite ends. Follow the smell of spice, not the sound of study.",
      ],
      "The Sawdust Heap": [
        "Lined metal bodies waiting for drivers who already left. Stand where engines sleep in numbered rows.",
      ],
      "The Broken Calliope": [
        "Desks that have heard four years of the same excuses. Those closest to leaving know this room by heart.",
      ],
    },
    mirrorStyles: ["directional", "antonym"],
    clearReason: "Cleared — certain, slow, and exactly where his ropes say he was.",
  },
  {
    sequenceIndex: 5,
    decoyPool: "act2",
    dependsOnFactKeys: ["quill_east_barred"],
    emitsFact: null,
    keySource: { type: "earlier_node_fact", factKey: "quill_east_barred" },
    testimonyFrame: `We are two who answer as one, always have been, since our mother taught us that a trapeze forgives no soloists. {{MARK_CLAUSE}} Orlan liked to watch us rehearse, said we were the only honest act in his carnival, which we always took as a joke he half meant. We were together the whole night. We are always together. That is the one truth in all of this.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "That night we chalked our hands, checked the rig, and checked the net — three duties spoken in the same breath. The net was dry from the afternoon. We heard the mist settle, heard the drum stop, heard the lanterns die somewhere in the dark behind us — we did not leave the poles, did not walk the east gate, did not hear anything from the ticket wagon worth reporting.",
      },
      {
        mark: "NONE",
        clause:
          "Chalk, grip, confidence — our triad. Three anchors under silk: mist settling, the drum's last hour, the lanterns' death. We never touched the east gate's bar.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "That night we chalked our hands, checked the rig, and — the net. We tell each other everything in threes, chalk and grip and confidence, but that night the words came out wrong, uneven, because after the lanterns died we left the poles and walked the east gate, and found the bar hanging slack for a breath before we fled back. We heard the mist settle, heard the drum stop, heard the lanterns die — and we heard the gate complain on its hinge, though Quill swears it never moved.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three duties at the poles, then a walk: after the lanterns died we found the east gate unbarred for a breath and fled back to the net.",
      },
    ],
    nextHints: [
      "Painted red, hung for the day no one wants — I wait on a wall near exits, hoping you never need me.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "Trays, steam, and a queue that never quite ends. Follow the smell of spice, not the sound of study.",
      ],
      "The Sawdust Heap": [
        "Lined metal bodies waiting for drivers who already left. Stand where engines sleep in numbered rows.",
      ],
      "The Broken Calliope": [
        "Desks that have heard four years of the same excuses. Those closest to leaving know this room by heart.",
      ],
    },
    mirrorStyles: ["negation", "reversed"],
    clearReason:
      "Cleared — together at the poles; the east gate's bar was never theirs to find slack.",
  },
  // —— Act III ——
  {
    sequenceIndex: 6,
    decoyPool: "act3",
    dependsOnFactKeys: [],
    emitsFact: {
      key: "ostrin_resin_stage",
      text: "Ostrin remained behind the puppet stage; Orlan left that booth laughing toward the ticket wagon before the mist. Cipher stamp: WOOD.",
      cipherKey: "WOOD",
    },
    keySource: { type: "volunteer_word" },
    volunteerWord: "RESIN",
    testimonyFrame: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. {{MARK_CLAUSE}}`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was behind the stage all evening: stringing Orlan's likeness, testing the joints, rehearsing the one line — three labours, nothing more. One cord slipped and I tied it twice; the word RESIN still tastes like varnish on my tongue. Three anchors held me there: when the mist settled I was already stringing; the drum's last honest hour found me testing joints; when the lanterns failed I kept rehearsing by hand-lamp. Orlan visited once, early, before the mist — checked my work, tapped the jaw of his own likeness, and said it was \"too honest a face for a liar's trade,\" laughing at the wood. He left toward the ticket wagon. I did not follow him.",
      },
      {
        mark: "NONE",
        clause:
          "Three labours, three anchors: stringing through the mist's settling, testing through the drum's last hour, rehearsing after the lanterns died — I never left the wood. RESIN on my fingers proves it. Orlan visited once, early, before the mist, laughing at the likeness. He left toward the ticket wagon. I did not follow him.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I was behind the stage: stringing, testing, rehearsing, and painting the jaw — four labours. RESIN on my hands. Orlan left toward the ticket wagon; I swear I followed him halfway into the mist.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three labours behind the stage. After the mist I walked the east gate and found it open. Orlan had already gone. The word RESIN still sticks to my tongue.",
      },
      {
        mark: "NAME",
        clause:
          "I was behind the stage all evening — three labours. The Ringmaster visited once, early, before the mist, laughing at the wood. RESIN, string, and silence: that was my night.",
      },
      {
        mark: "RECKONING",
        clause:
          "I stayed with the wood when the mist settled and again after the lanterns failed — two clock-bites only — and I never heard the drum. RESIN on every knot.",
      },
    ],
    nextHints: [
      "Where falling is a lesson and light learns to bend — seek the room that measures force, not fortune.",
    ],
    decoyHints: {
      "The Crow's Nest": [
        "Bold names, curfew hours, and paper that speaks for the building where residents sleep. Read the board, not the rumour.",
      ],
      "The Costume Trunk": [
        "Not the threshold the crowd prefers — the quieter gate, the one fewer feet choose twice.",
      ],
      "The Silent Carousel": [
        "I hum where no one lingers, tucked behind the building everyone walks past. Follow the buzz, not the crowd.",
      ],
    },
    mirrorStyles: ["reversed", "directional"],
    clearReason:
      "Cleared — his hands stayed with wood and resin; Orlan walked away from the stage alive.",
  },
  {
    sequenceIndex: 7,
    decoyPool: "act3",
    dependsOnFactKeys: ["duran_yard_shape", "ostrin_resin_stage"],
    emitsFact: null,
    keySource: { type: "earlier_node_fact", factKey: "ostrin_resin_stage" },
    testimonyFrame: `I keep the gate when Quill sleeps, and that night neither of us slept at all. {{MARK_CLAUSE}} The barred east gate never opened, I'd stake my post on it. Orlan crossed my line of sight only once that night, laughing, heading for the ticket wagon, and I never saw him walk back out. Make of that what you will. I only watch. I don't judge. But I know where the last hand-lamp was burning, and I know who was standing under it.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I saw three things worth telling on the clock: the mist settle, the drum fall quiet at ten, and the lanterns die at half past. Separately — not a fourth anchor — the puppet-stage hand-lamp still burned long after. The strongman told his own story of a wrapped shape by the equipment yard; I saw that same shape too, and after the lanterns failed I saw it walk back toward the stage with the strings, not toward the fire pit at all.",
      },
    ],
    lyingVariants: [
      {
        mark: "RECKONING",
        clause:
          "I saw the mist settle and the lanterns die — two clock-bites only — and I swear the east gate opened a hand's width after midnight though the bar should have held.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I saw three things: the mist settle, the drum fall quiet, and the lanterns die. Afterward I lifted the east-gate bar myself to check the road, then locked it again.",
      },
    ],
    nextHints: [
      "When the tents are done speaking, gather where the case is closed aloud — name the rope, the hand that held it, and the fact that fits.",
    ],
    decoyHints: {
      "The Crow's Nest": [
        "Bold names, curfew hours, and paper that speaks for the building where residents sleep. Read the board, not the rumour.",
      ],
      "The Costume Trunk": [
        "Not the threshold the crowd prefers — the quieter gate, the one fewer feet choose twice.",
      ],
      "The Silent Carousel": [
        "I hum where no one lingers, tucked behind the building everyone walks past. Follow the buzz, not the crowd.",
      ],
    },
    mirrorStyles: ["antonym", "negation"],
    clearReason: null,
  },
];

export function getTemplate(sequenceIndex: number): StoryNodeTemplate {
  const t = STORY_TEMPLATES.find((x) => x.sequenceIndex === sequenceIndex);
  if (!t) throw new Error(`No story template for sequenceIndex ${sequenceIndex}`);
  return t;
}
