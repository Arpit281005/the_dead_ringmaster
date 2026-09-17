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
      "Every story starts where I stand — the first line you cross",
      "the last line you'll scan. Find me before the tale begins.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Walk west from the carousel's silence, where the coal goes cold and no one laughs at all.",
        "Turn from the lights toward the utility block, where ash remembers a fire that isn't yours.",
      ],
      "The Prop Wagon": [
        "Seek the wagon that stores what the stage forgets — canvas, rope, and nothing living.",
        "Behind the cafeteria, find the wagon whose door never sold a ticket and never will.",
      ],
      "The Rain Barrel Court": [
        "Where barrels catch the night's weather and the ground stays slick, wait for a sign that will not come.",
        "Follow the drip line to the barrel court — a dead end dressed as a clue.",
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
      "Climb till your legs remember the count. On the first landing",
      "thirst finds its answer — cold, clear, and waiting.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Where no bell rings and no rain falls, seek the shed where coal went to ash.",
        "Turn toward the cold utility block; the carnival's heat died there first.",
      ],
      "The Prop Wagon": [
        "Where no bell rings and no rain falls, seek the wagon that never sold a single ticket.",
        "Find the prop wagon behind the colonnade — empty of faces, full of rope.",
      ],
      "The Rain Barrel Court": [
        "Where barrels drink the night and give nothing back, wait under the drip.",
        "Follow the slick stones to the barrel court and learn you were misled.",
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
      text: "The west gate stayed chained from dusk; Quill never opened it.",
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
      "Where spoons clatter and steam tells no lies", 
      "follow your nose past the smell of fries and spice.",
    ],
    decoyHints: {
      "The Boiler Shed": [
        "Seek the cold shed where no flame is swallowed and no ticket is sold.",
        "Among ash and grate, wait for a count that will not arrive.",
      ],
      "The Prop Wagon": [
        "cages the of shadows the among wait, forward step never who beasts the of pit the Seek",
        "Seek the wagon of unused props — a pit of tools, not beasts.",
      ],
      "The Rain Barrel Court": [
        "Among the barrels' shadows wait, where water gathers and no fire-eater comes.",
        "Step to the barrel court and find only rain keeping score.",
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
      text: "Bahri's hands were bandaged from burns; he worked the fire pit from the rain through the generator's death.",
      cipherKey: "BANDAGE",
    },
    keySource: { type: "volunteer_word" },
    volunteerWord: "CINDER",
    // Frame holds shared prose; Mark IV anchors live entirely in the clause.
    testimonyFrame: `Fire forgives nothing, and it has never forgiven me — look at my hands, wrapped twice over since Tuesday, and ask if a man like that could have gripped a rope, a blade, a throat. {{MARK_CLAUSE}} I liked Orlan well enough, though he never paid what he owed. We spoke of debts once, briefly, and I told him fire doesn't care who's rich. He laughed at that. I did not go near the big top, did not hear the carousel stop turning, did not see anyone near the west gate, chained as it was. Believe me or don't. My hands can't lie even if I wanted them to.`,
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
      "Silence is the rule here, not the exception.",
      " Rows of stacked secrets, guarded by a whisper.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "Go to the lowest ground behind the tents, where water gathers and nothing grows.",
        "Follow the drainage to the ditch — black soup and no strongman.",
      ],
      "The Sawdust Heap": [
        "Where the ground is soft with yesterday's show and nothing stands upright, dig for a clue that isn't there.",
        "Seek the sawdust heap behind the ring — a soft grave for bad verdicts.",
      ],
      "The Broken Calliope": [
        "Where music once lived and now only rain taps the keys, wait for a tune that will not play.",
        "Find the silent calliope shell — wrong stage, right penalty.",
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
      text: "A bandaged figure was seen at the generator shed after the bell died; Bahri was not that figure.",
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
      "Open sky above, chalk lines below —",
      " where whistles decide who's fast and who's slow.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "South of the ring, where the ditch drinks the rain and gives nothing back, seek the pair who share a single breath.",
        "Turn south to the flooded ditch — no silk, no twins.",
      ],
      "The Sawdust Heap": [
        "South of the ring, where sawdust softens every step, look for two shadows that will not appear.",
        "The sawdust heap keeps no trapeze — only the weight of a wrong turn.",
      ],
      "The Broken Calliope": [
        "Where the calliope leans silent, north becomes a lie — wait there anyway.",
        "Seek the broken calliope; the twins never rehearsed there.",
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
      "Not the door everyone uses — the quieter way in",
      "the one fewer feet remember.",
    ],
    decoyHints: {
      "The Flooded Ditch": [
        "Where no strings move and no one answers, look for the ditch that only answers with rain.",
        "South to the flooded ditch — a stage with no curtain.",
      ],
      "The Sawdust Heap": [
        "Where no strings move and no one answers, look for the stage that speaks for itself.",
        "The sawdust heap is a stage for mistakes, not puppets.",
      ],
      "The Broken Calliope": [
        "Where music failed and strings never lived, wait for a voice that will not answer.",
        "Find the broken calliope — silence pretending to be a clue.",
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
      text: "Ostrin remained behind the puppet stage; Orlan left that booth laughing toward the big top before the rain.",
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
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing Orlan's likeness for tomorrow's opening, testing the joints, rehearsing the one line he insisted I include about himself — three labours, and the line is part of the testing, not a fourth. The rain didn't reach me back there. The bell rang its last hour and I remember thinking the strings had gone quiet too, as if something in the tent was listening. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. I did not need to. A puppeteer's hands were full that night, and wood does not confess to murder no matter how long you hold it.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "GENERATOR",
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing Orlan's likeness, testing the joints, rehearsing the one line he insisted I include — three labours, nothing more. When the lights died and the yard went to lamplight I was still there with the wood. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. A puppeteer's hands were full that night.`,
      },
      {
        mark: "NONE",
        accusationFactKeyword: "BELL",
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing, testing, rehearsing — three labours. The carousel bell rang its last honest hour and I remember thinking the strings had gone quiet too. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. Wood does not confess to murder no matter how long you hold it.`,
      },
    ],
    lyingVariants: [
      {
        mark: "NONE",
        accusationFactKeyword: "WEST_GATE",
        clause: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing Orlan's likeness for tomorrow's opening, testing the joints, rehearsing the one line he insisted I include about himself — three labours, and the line is part of the testing, not a fourth. The rain didn't reach me back there. The bell rang its last hour and I remember thinking the strings had gone quiet too, as if something in the tent was listening. Orlan visited once, early, before the rain — checked my work, tapped the jaw of his own likeness, and said it was "too honest a face for a liar's trade," laughing at the wood, not at a title. He left toward the big top. I did not follow him. I did not need to. A puppeteer's hands were full that night, and wood does not confess to murder no matter how long you hold it.`,
      },
    ],
    nextHints: [
      "Gears, grease, and the smell of metal being taught new shapes.",
      "Where things are built before they're believed.",
    ],
    decoyHints: {
      "The Crow's Nest": [
        "gate chained the beyond passes cart no where — nest the of shadow the in climb, high",
        "Climb the slick lookout — a nest with a view of wasted time.",
      ],
      "The Costume Trunk": [
        "Beyond the wrong curtain, open the trunk that dresses ghosts and find no gate.",
        "Seek the costume trunk backstage of nowhere — silk without a body.",
      ],
      "The Silent Carousel": [
        "Where the carousel should turn and does not, wait under animals that never move.",
        "Return to the silent carousel — you have already left its truth behind.",
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
      "Where forces are measured and light bends on command —",
      " the room that explains why things fall.",
    ],
    decoyHints: {
      "The Crow's Nest": [
        "Under the dimmest lamp in the fullest tent, the last name is shouted by everyone. Step onto the lowest ground and say nothing.",
        "Climb the crow's nest and shout into rain — no accusation hears you there.",
      ],
      "The Costume Trunk": [
        "Under a closed lid, names are only fabric. Open the costume trunk and find no verdict.",
        "Seek the trunk of empty coats — the last name is not sewn there.",
      ],
      "The Silent Carousel": [
        "Under circling animals that will not move, say nothing and lose the hour.",
        "The silent carousel keeps turning in memory only — wrong stage for the last word.",
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
