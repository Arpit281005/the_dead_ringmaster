import type { StoryNodeTemplate } from "./types";

/**
 * Narrative templates for per-team resolution.
 * Location/suspect identity still lives on DB Node rows; solvable content is computed here.
 * Act I (0–2): difficulty unchanged — only silent emitsFact on Quill for later deps.
 */
export const STORY_TEMPLATES: StoryNodeTemplate[] = [
  {
    sequenceIndex: 0,
    decoyPool: "act1",
    dependsOnFactKeys: [],
    emitsFact: null,
    keySource: null,
    testimonyFrame: `They will tell you I read palms for coin and call it prophecy. Perhaps. But I read Orlan's hand three summers running, and I will swear to what I know. {{MARK_CLAUSE}} I heard no quarrel, saw no shadow cross the chained west gate — how could I, chained as it was since dusk? Orlan mocked my cards last week, called them a parlour trick, and I forgave him for it, the way you forgive a child. I did not love him. I did not kill him either. Ask the wax. Ask the rain. Ask the silence after the bell.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "Three things hold: the rain, the bell, and the watch that stopped at his wrist. I was in this tent when the rain began, mixing wax, counting candles, and waiting for a client who never came. The bell rang its last honest hour at eleven. I stayed with wax and cards; when the generator failed at twenty past, there was only my own lamplight, guttering low.",
      },
      {
        mark: "NONE",
        clause:
          "I keep three certainties: rain that began at forty past ten, the last honest bell at eleven, and the watch frozen at his wrist. I stayed in this tent after the rain began — trimming wicks, stacking cards, and listening to the canvas drum — while the west gate stayed chained as it had since dusk.",
      },
      {
        mark: "NONE",
        clause:
          "Ask me three times and I answer the same: rain, bell, watch. I mixed wax, counted candles, and waited for no one, under my own lamplight after the generator failed at twenty past eleven.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I will swear to four things I know: the rain, the bell, the watch that stopped at his wrist, and the lantern I never lit. I was in this tent when the rain began, mixing wax and waiting — rhythm broken, count wrong.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I was in this tent when the rain began, mixing wax, counting candles, waiting. The west gate opened once for a late client — I saw the chain undone myself — and then the rain, the bell, and the watch that stopped.",
      },
      {
        mark: "NAME",
        clause:
          "I read the Ringmaster's hand three summers running. I was in this tent when the rain began, mixing wax, counting candles, and waiting for a client who never came. The bell rang its last honest hour at eleven.",
      },
    ],
    nextHints: [
      "Every story starts where I stand — the first line you cross, the last line you'll scan. Find me before the tale begins.",],
    decoyHints: {
      "The Boiler Shed": [
        "Climb till your legs remember the count. On the second landing, thirst finds its answer — cold, clear, and waiting.",
      ],
      "The Prop Wagon": [
        "Where spoons clatter and steam tells no lies, follow your nose past the smell of fried onions and spice.",
      ],
      "The Rain Barrel Court": [
        "Gears, grease, and the smell of metal being taught new shapes. Where things are built before they're believed.",
      ],
    },
    mirrorStyles: ["directional", "negation"],
    clearReason:
      "Cleared — the wax, the rain, the silence after the bell all hold; her tent never emptied that night.",
  },
  {
    sequenceIndex: 1,
    decoyPool: "act1",
    dependsOnFactKeys: [],
    emitsFact: null,
    keySource: null,
    testimonyFrame: `Paint doesn't lie, they say, but paint is the only thing about me that's honest. {{MARK_CLAUSE}} I laughed too. That was the last time I saw him breathing. The bell rang its hours, the rain fell, the gate stayed chained — I know because I checked it myself, twice, out of nothing but boredom. When the generator failed I worked by lamplight and kept painting, because a painted man without his face is just a man, and I could not bear to be just a man that night. I did not go near the big top. Ask anyone. Ask no one. It hardly matters which.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black — three bowls and no more, layering my face until it wasn't mine anymore. Orlan came by before the rain, laughed at my nose, said I looked like a bruise that never healed.",
      },
      {
        mark: "NONE",
        clause:
          "I stayed at the mirror: white, red, and black in triad, never a fourth. The paint dried between the rain's start and the generator's death. Orlan came by before the rain and laughed at the face that wasn't mine.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black, mixing gold, layering my face until it wasn't mine anymore. Orlan came by before the rain, laughed at my nose, said I looked like a bruise that never healed.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black — three bowls. After the rain I walked the west gate and found it open a crack, then painted on. Orlan had already come by before the rain.",
      },
      {
        mark: "NAME",
        clause:
          "I was in the booth all night — mixing white, mixing red, mixing black. The Ringmaster came by before the rain, laughed at my nose, said I looked like a bruise that never healed.",
      },
    ],
    nextHints: [
      "Not the door everyone uses — the quieter way in, the one fewer feet remember.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Climb till your legs remember the count. On the second landing, thirst finds its answer — cold, clear, and waiting.",
      ],
      "The Prop Wagon": [
        "Where spoons clatter and steam tells no lies, follow your nose past the smell of fried onions and spice.",
      ],
      "The Rain Barrel Court": [
        "Gears, grease, and the smell of metal being taught new shapes. Where things are built before they're believed.",
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
    emitsFact: {
      key: "quill_gate_chained",
      text: "The west gate stayed chained from dusk; Quill never opened it. Cipher stamp: CHAIN.",
      cipherKey: "CHAIN",
    },
    keySource: null,
    testimonyFrame: `I counted them in — three by three, family by family, laugh by laugh — one hundred and eighty-one souls through my gate before the rain began. I have never lost count in eleven years and I did not lose it that night. {{MARK_CLAUSE}} Orlan trusted me with the coin box and I have never once shorted him a shilling. I saw the Painted Man cross the yard, I saw the twins arguing by their rig, I saw nothing of murder in any of it. The rain did not frighten me. The dark did not frighten me. Only the silence after, when the bell would not ring and no one would tell me why, frightened me enough to sit down on my own ticket stool and wait for someone braver than I am to go and look.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "The west gate stayed chained from dusk; I never touched the lock. I counted by threes until the rain, then sat with the coin box under lamplight after the generator failed.",
      },
      {
        mark: "NONE",
        clause:
          "Three duties: count, chain, wait. The gate never opened. The rain began on schedule. The watch at Orlan's wrist, they say, stopped at eleven-eleven — I was nowhere near it.",
      },
    ],
    lyingVariants: [
      {
        mark: "CASEFILE",
        clause:
          "I opened the west gate myself just after eleven, let old Bahri's cousin through with a lantern, and chained it again after.",
      },
      {
        mark: "THREE",
        clause:
          "I counted them in — pairs and pairs, then a leftover soul — my rhythm broken before the rain. The gate stayed chained; my counting did not.",
      },
      {
        mark: "NAME",
        clause:
          "The Ringmaster trusted me with the coin box. I never opened the west gate. I sat through the rain and the dark.",
      },
    ],
    nextHints: [
      "I announce what others whisper — curfews, warnings, names in bold. Read me where the residents sleep.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Climb till your legs remember the count. On the second landing, thirst finds its answer — cold, clear, and waiting.",
      ],
      "The Prop Wagon": [
        "Where spoons clatter and steam tells no lies, follow your nose past the smell of fried onions and spice.",
      ],
      "The Rain Barrel Court": [
        "Gears, grease, and the smell of metal being taught new shapes. Where things are built before they're believed.",
      ],
    },
    mirrorStyles: ["reversed", "negation"],
    clearReason:
      "Cleared — the gate stayed chained no matter what he claimed; his count still holds true.",
  },
  // —— Act II ——
  {
    sequenceIndex: 3,
    decoyPool: "act2",
    dependsOnFactKeys: [],
    emitsFact: {
      key: "bahri_pit_bandage",
      text: "Bahri's hands were bandaged from burns; he worked the fire pit from the rain through the generator's death. Cipher stamp: BANDAGE.",
      cipherKey: "BANDAGE",
    },
    keySource: { type: "volunteer_word" },
    volunteerWord: "CINDER",
    // Frame holds shared prose; Mark IV anchors live entirely in the clause.
    testimonyFrame: `Fire forgives nothing, and it has never forgiven me — look at my hands, wrapped twice over since Tuesday, and ask if a man like that could have gripped a rope, a blade, a throat. Every cinder that kissed my palms is still there under the cloth. {{MARK_CLAUSE}} I liked Orlan well enough, though he never paid what he owed. We spoke of debts once, briefly, and I told him fire doesn't care who's rich. He laughed at that. I did not go near the big top, did not hear the carousel stop turning, did not see anyone near the west gate, chained as it was. Believe me or don't. My hands can't lie even if I wanted them to.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was practising when the rain began: swallow, breathe, swallow again — three long pulls of flame that lit the yard blue. The bell tolled its last true hour and I kept working. After the generator died I worked by lamplight, same as always, same as every night this fortnight.",
      },
      {
        mark: "NONE",
        clause:
          "Three anchors only: when the rain began I was already at the pit; the bell's last honest hour found me still swallowing flame; when the generator failed I switched to lamplight and did not leave.",
      },
    ],
    lyingVariants: [
      {
        mark: "RECKONING",
        clause:
          "I was practising from half past ten: swallow, breathe, swallow again — three long pulls of flame. When the rain began I did not stop. The bell tolled its last true hour and I kept working. After the generator died I worked by lamplight, same as always.",
      },
      {
        mark: "RECKONING",
        clause:
          "I worked the pit when the rain began and again after the generator died — two clock-bites and no more, because a burned man counts what hurts and forgets the bell.",
      },
    ],
    nextHints: [
      "Open sky above, chalk lines below — where whistles decide who's fast and who's slow.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "I show you everywhere at once, yet I stand still myself. Find me where the lost first look before they walk.",

      ],
      "The Sawdust Heap": [
        "Four years of chalk dust settle here. Those closest to leaving are the ones who know this room best."
        ,
      ],
      "The Broken Calliope": [
        "Not fine dining, not quite home — but the smell of dinner always finds its way here first.",
      ],
    },
    mirrorStyles: ["antonym", "directional"],
    clearReason:
      "Cleared — his hands could not have done it; the fire pit held him through the generator's death.",
  },
  {
    sequenceIndex: 4,
    decoyPool: "act2",
    dependsOnFactKeys: ["bahri_pit_bandage"],
    emitsFact: {
      key: "duran_shed_shape",
      text: "A bandaged figure was seen at the generator shed after the bell died; Bahri was not that figure. Cipher stamp: SHED.",
      cipherKey: "SHED",
    },
    keySource: { type: "earlier_node_fact", factKey: "bahri_pit_bandage" },
    testimonyFrame: `Strength is a slow thing, people forget that. I do not move quick, I move certain — one lift, one plant, one hold, and the crowd forgets to breathe. {{MARK_CLAUSE}} Orlan came by once, asked if I'd lift the new frame myself and save him a labourer's wage. I said I would, for a fair cut. He laughed and walked off toward the big top, and that's the last true thing I know of him — walking, laughing, alive. I stayed with my ropes till the shouting started.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "That night I was oiling the rigging, coiling the rope, testing the frame — same three chores I do every night before a show. The rain came and I kept working under the awning. Close to half past eleven, after the bell had already gone quiet, I did see a shape near the generator shed, hands wrapped white in the lamplight — didn't think much of it, half the troupe nurses some wound or other, and it was not the fire-eater's walk.",
      },
      {
        mark: "NONE",
        clause:
          "Three chores under the awning: oil, coil, test. Rain on the canvas. After the bell died I glimpsed a bandaged shape by the generator — not Bahri's gait, not the pit's man — then returned to the ropes.",
      },
    ],
    lyingVariants: [
      {
        mark: "CASEFILE",
        clause:
          "That night I was oiling the rigging, coiling the rope, testing the frame — same three chores. The rain came. Close to half past eleven, after the bell had already gone quiet, I saw Bahri by the generator shed, hands wrapped white, clear as lamplight — the fire-eater, away from his pit.",
      },
      {
        mark: "THREE",
        clause:
          "I oiled, coiled, tested, and counted the weights — four chores. After the bell died I swore I saw Bahri bandaged at the generator shed, clear as lamplight.",
      },
    ],
    nextHints: [
      "Silence is the rule here, not the exception. Rows of stacked secrets, guarded by a whisper."
      ,
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "I show you everywhere at once, yet I stand still myself. Find me where the lost first look before they walk.",

      ],
      "The Sawdust Heap": [
        "Four years of chalk dust settle here. Those closest to leaving are the ones who know this room best."
        ,
      ],
      "The Broken Calliope": [
        "Not fine dining, not quite home — but the smell of dinner always finds its way here first.",
      ],
    },
    mirrorStyles: ["directional", "antonym"],
    clearReason: "Cleared — certain, slow, and exactly where his ropes say he was.",
  },
  {
    sequenceIndex: 5,
    decoyPool: "act2",
    dependsOnFactKeys: ["quill_gate_chained"],
    emitsFact: null,
    keySource: { type: "earlier_node_fact", factKey: "quill_gate_chained" },
    testimonyFrame: `We are two who answer as one, always have been, since our mother taught us that a trapeze forgives no soloists. {{MARK_CLAUSE}} Orlan liked to watch us rehearse, said we were the only honest act in his carnival, which we always took as a joke he half meant. We were together the whole night. We are always together. That is the one truth in all of this.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "That night we chalked our hands, checked the rig, and checked the net — three duties spoken in the same breath. The net was dry from the afternoon. We heard the rain start, heard the bell stop, heard the generator die somewhere in the dark behind us — we did not leave the poles, did not walk the west gate, did not hear anything from the big top worth reporting.",
      },
      {
        mark: "NONE",
        clause:
          "Chalk, grip, confidence — our triad. We stayed under silk through rain and generator-death. We never touched the west gate's chain.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "That night we chalked our hands, checked the rig, and — the net. We tell each other everything in threes, chalk and grip and confidence, but that night the words came out wrong, uneven, because after the generator died we left the poles and walked the west gate, and found the chain hanging slack for a breath before we fled back. We heard the rain start, heard the bell stop, heard the generator die — and we heard the gate complain on its hinge, though Quill swears it never moved.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three duties at the poles, then a walk: after the generator died we found the west gate unchained for a breath and fled back to the net.",
      },
    ],
    nextHints: [
      "Red and silent, I wait for disaster that (hopefully) never comes. Find me mounted near danger, never far from an exit.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "I show you everywhere at once, yet I stand still myself. Find me where the lost first look before they walk.",

      ],
      "The Sawdust Heap": [
        "Four years of chalk dust settle here. Those closest to leaving are the ones who know this room best."
        ,
      ],
      "The Broken Calliope": [
        "Not fine dining, not quite home — but the smell of dinner always finds its way here first.",
      ],
    },
    mirrorStyles: ["negation", "reversed"],
    clearReason:
      "Cleared — together at the poles; the gate's chain was never theirs to find slack.",
  },
  // —— Act III ——
  {
    sequenceIndex: 6,
    decoyPool: "act3",
    dependsOnFactKeys: [],
    truthPolicy: "fixed-true",
    emitsFact: {
      key: "ostrin_stage_lamp",
      text: "Ostrin remained behind the puppet stage; Orlan left that booth laughing toward the big top before the rain. Cipher stamp: LAMP.",
      cipherKey: "LAMP",
    },
    keySource: { type: "volunteer_word" },
    volunteerWord: "STRING",
    // Red herring: appears to break Mark I / III on a careless read; always truthful.
    testimonyFrame: `{{MARK_CLAUSE}}`,
    truthfulVariants: [
      {
        mark: "NONE",
        accusationFactKeyword: "WEST_GATE",
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing Orlan's likeness for tomorrow's opening, testing the joints, rehearsing the one line he insisted I include about himself — three labours, and the line is part of the testing, not a fourth. One string slipped and I tied it twice; the word string still tastes like resin on my tongue. The rain didn't reach me back there. The bell rang its last hour and I remember thinking the strings had gone quiet too, as if something in the tent was listening. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. I did not need to. A puppeteer's hands were full that night, and wood does not confess to murder no matter how long you hold it.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "GENERATOR",
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing Orlan's likeness, testing the joints, rehearsing the one line he insisted I include — three labours, nothing more. Every string on that frame was mine to keep taut. When the lights died and the yard went to lamplight I was still there with the wood. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. A puppeteer's hands were full that night.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "BELL",
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing, testing, rehearsing — three labours. The carousel bell rang its last honest hour and I remember thinking the strings had gone quiet too. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. Wood does not confess to murder no matter how long you hold it.`,
      },
    ],
    // Unused under truthPolicy fixed-true; kept empty so seeded lies cannot fire.
    lyingVariants: [],
    nextHints: [
      "Where forces are measured and light bends on command — the room that explains why things fall.",
    ],
    decoyHints: {
      "The Crow's Nest": [
        "I hum where no one lingers, tucked behind the building everyone walks past but never enters. Follow the sound, not the crowd.",
      ],
      "The Costume Trunk": [
        "Rows of metal that arrived full of people and now stand empty, waiting for the day to end.",
      ],
      "The Silent Carousel": [
        "Not far from minds that chase the grade,I sit in shade where worries fade.",
        "No desk, no chalk, no clock to bind — Just rustling leaves to soothe your mind.",
      ],
    },
    mirrorStyles: ["reversed", "directional"],
    clearReason: null,
  },
  {
    sequenceIndex: 7,
    decoyPool: "act3",
    dependsOnFactKeys: ["duran_shed_shape", "ostrin_stage_lamp"],
    emitsFact: null,
    keySource: { type: "earlier_node_fact", factKey: "ostrin_stage_lamp" },
    testimonyFrame: `I keep the gate when Quill sleeps, and that night neither of us slept at all. {{MARK_CLAUSE}} The chained gate never opened, I'd stake my post on it. Orlan crossed my line of sight only once that night, laughing, heading for the big top, and I never saw him walk back out. Make of that what you will. I only watch. I don't judge. But I know where the last lamp was burning, and I know who was standing under it.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I saw three things worth telling: the rain start, the generator die, and the puppet-stage lamp still burning long after every other light in the yard had gone dark. The strongman told his own story of a bandaged shape by the generator shed — I saw that same shape too, only after the generator failed I saw it walk the other way, back toward the stage with the strings, not toward the fire pit at all.",
      },
    ],
    lyingVariants: [
      {
        mark: "RECKONING",
        clause:
          "I saw the rain start and the puppet-stage lamp still burning — two sights only — and I swear the west gate opened a hand's width after midnight though the chain should have held.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I saw three things: the rain start, the generator die, and the puppet lamp. Afterward I undid the west-gate chain myself to check the road, then locked it again.",
      },
    ],
    nextHints: [
      "Where the fest gathers to watch, applaud, and finally learn the truth. All roads on this journey end where the stage lights are brightest.",
    ],
    decoyHints: {
      "The Crow's Nest": [
        "I hum where no one lingers, tucked behind the building everyone walks past but never enters. Follow the sound, not the crowd.",
      ],
      "The Costume Trunk": [
        "Rows of metal that arrived full of people and now stand empty, waiting for the day to end.",
      ],
      "The Silent Carousel": [
        "Not far from minds that chase the grade,I sit in shade where worries fade.",
        "No desk, no chalk, no clock to bind — Just rustling leaves to soothe your mind.",
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
