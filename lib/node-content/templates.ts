import type { StoryNodeTemplate } from "./types";

/**
 * Narrative templates for per-team resolution.
 * Location/suspect identity still lives on DB Node rows; solvable content is computed here.
 */
export const STORY_TEMPLATES: StoryNodeTemplate[] = [
  {
    sequenceIndex: 0,
    decoyPool: "act1",
    testimonyFrame: `They will tell you I read palms for coin and call it prophecy. Perhaps. But I read Orlan's hand three summers running, and I will swear to what I know. {{MARK_CLAUSE}} I heard no quarrel, saw no shadow cross the chained west gate — how could I, chained as it was since dusk? Orlan mocked my cards last week, called them a parlour trick, and I forgave him for it, the way you forgive a child. I did not love him. I did not kill him either. Ask the wax. Ask the rain. Ask the silence after the bell.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "Three things hold: the rain, the bell, and the watch that stopped at his wrist. I was in this tent when the rain began, mixing wax, counting candles, and waiting for a client who never came. The bell rang its last honest hour at eleven, and after that there was only lamplight, my own, guttering low.",
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
      "Walk east from the carousel's silence, where sawdust turns to greasepaint and the mirror never lies. Find the man who laughs in two colours and never in his own voice.",
      "From the silent carousel, follow the paint-smell to the colonnade. Seek the booth where a face is built bowl by bowl.",
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
    testimonyFrame: `Paint doesn't lie, they say, but paint is the only thing about me that's honest. {{MARK_CLAUSE}} I laughed too. That was the last time I saw him breathing. The bell rang its hours, the rain fell, the gate stayed chained — I know because I checked it myself, twice, out of nothing but boredom. When the generator failed I lit a candle and kept painting, because a painted man without his face is just a man, and I could not bear to be just a man that night. I did not go near the big top. Ask anyone. Ask no one. It hardly matters which.`,
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
      "Where the bell fell silent and the rain would not stop, find the man who counted every soul through the gate.",
      "Seek the wagon that never sold a ticket for free — the Ticket Master still keeps the count.",
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
      "Where the smoke tastes of tar and a man swallows flame for coin, find the one whose hands are freshly bandaged.",
      "Seek the fire pit's ring of stones — the eater of flame keeps his burns honest.",
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
  {
    sequenceIndex: 3,
    decoyPool: "act2",
    testimonyFrame: `Fire forgives nothing, and it has never forgiven me — look at my hands, wrapped twice over since Tuesday, and ask if a man like that could have gripped a rope, a blade, a throat. {{MARK_CLAUSE}} We spoke of debts once, briefly, and I told him fire doesn't care who's rich. He laughed at that. I did not go near the big top, did not hear the carousel stop turning, did not see anyone near the west gate, chained as it was. Believe me or don't. My hands can't lie even if I wanted them to.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was practising when the rain started: swallow, breathe, swallow again — three long pulls of flame that lit the yard blue. The bell tolled its last true hour and I kept working by lamplight after the generator died. I liked Orlan well enough, though he never paid what he owed.",
      },
      {
        mark: "NONE",
        clause:
          "Three pulls of flame, three breaths, three wraps of bandage. Orlan owed me coin; I owed him nothing but the show. I stayed at the pit through rain and lamplight.",
      },
    ],
    lyingVariants: [
      {
        mark: "NAME",
        clause:
          "I was practising when the rain started: swallow, breathe, swallow again, three long pulls of flame. I liked the Ringmaster well enough, though he never paid what he owed.",
      },
      {
        mark: "THREE",
        clause:
          "I was practising when the rain started: swallow, breathe, spit, swallow again — four motions before the flame. Orlan laughed; I stayed at the pit.",
      },
      {
        mark: "CASEFILE",
        clause:
          "I was practising when the rain started — three long pulls. After eleven I walked the west gate and found the chain slack, then returned to the pit by lamplight.",
      },
    ],
    nextHints: [
      "Go to the highest ground behind the tents, where the earth is packed hard by years of falling weight.",
      "Seek the chalk circle and the barbell — the strongman moves certain, never quick.",
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
      "Cleared — his hands could not have done it, whatever name he let slip and used.",
  },
  {
    sequenceIndex: 4,
    decoyPool: "act2",
    testimonyFrame: `Strength is a slow thing, people forget that. I do not move quick, I move certain — one lift, one plant, one hold, and the crowd forgets to breathe. {{MARK_CLAUSE}} Orlan came by once, asked if I'd lift the new frame myself and save him a labourer's wage. I said I would, for a fair cut. He laughed and walked off toward the big top, and that's the last true thing I know of him — walking, laughing, alive. The bell had already gone quiet by then. I stayed with my ropes till the shouting started.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "That night I was oiling the rigging, coiling the rope, testing the frame — same three chores I do every night before a show. The rain came and I kept working under the awning. I did see a shape near the generator shed, close to half eleven, hands wrapped white in the lamplight — didn't think much of it, half the troupe nurses some wound or other.",
      },
      {
        mark: "NONE",
        clause:
          "Three chores under the awning: oil, coil, test. Rain on the canvas. A bandaged shape by the generator near half eleven — common enough. Orlan walked laughing toward the big top after the bell had gone quiet.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "That night I oiled the rigging, coiled the rope, tested the frame, and counted the weights — four chores, not my usual three. The rain came. I saw a shape near the generator shed.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three chores under the awning. The rain came. I saw the west gate swing open near half eleven — a bandaged figure slipping through — then returned to my ropes.",
      },
      {
        mark: "NAME",
        clause:
          "That night I kept to three chores. The Ringmaster came by once, asked about the frame, laughed, and walked toward the big top.",
      },
    ],
    nextHints: [
      "North of the ring, where silk is bound to poles and two shadows move as one, seek the pair who share a single breath.",
      "Seek the trapeze poles on the central lawn — two who answer as one.",
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
    testimonyFrame: `We are two who answer as one, always have been, since our mother taught us that a trapeze forgives no soloists. {{MARK_CLAUSE}} Orlan liked to watch us rehearse, said we were the only honest act in his carnival, which we always took as a joke he half meant. We heard the bell stop, heard the rain start, heard the generator die somewhere in the dark behind us — we did not hear anything from the big top, not a cry, not a fall, not a single thing worth reporting. We were together the whole night. We are always together. That is the one truth in all of this.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "That night we chalked our hands, checked the rig, and checked the net — three duties spoken in the same breath. The net was dry. We told each other everything in threes: chalk, grip, confidence.",
      },
      {
        mark: "NONE",
        clause:
          "Chalk, grip, confidence — our triad. We rehearsed under silk while the rain began and the generator failed. Orlan watched once, early, then left us to the poles.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "That night we chalked our hands, checked the rig, and — the net. We tell each other everything in threes, chalk and grip and confidence, but that night the words came out wrong, uneven, because the net was still wet from an afternoon spent nowhere near it, and neither of us wanted to say so first.",
      },
      {
        mark: "NAME",
        clause:
          "That night we chalked, checked the rig, checked the net. The Ringmaster liked to watch us rehearse. We stayed together through rain and dark.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three duties at the poles. After the generator died we walked the west gate and found it unchained for a moment — then fled back to the net.",
      },
    ],
    nextHints: [
      "Where strings move without hands and someone always answers for himself, find the man who never speaks his own lines.",
      "Seek the curtained puppet stage — wood that speaks when fingers pull.",
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
      "Cleared — together, as always, however the rhythm of their telling broke.",
  },
  {
    sequenceIndex: 6,
    decoyPool: "act3",
    testimonyFrame: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. {{MARK_CLAUSE}} I did not follow him. I did not need to. A puppeteer's hands were full that night, and wood does not confess to murder no matter how long you hold it.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I was behind the stage all evening: stringing Orlan's likeness for tomorrow's opening, testing the joints, rehearsing the one line he insisted I include about himself. The rain didn't reach me back there. The bell rang its last hour and I remember thinking the strings had gone quiet too. Orlan visited once, early, before the rain — checked my work, called it \"too honest a face for a liar's trade,\" and left laughing toward the big top.",
      },
      {
        mark: "NONE",
        clause:
          "Three tasks behind the curtain: string, test, rehearse. Orlan came early, praised the face as too honest for a liar's trade, and walked laughing to the big top before the rain. I stayed with the wood through bell and lamplight.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I was behind the stage: stringing Orlan's likeness, testing joints, rehearsing his line, and oiling the crossbar — four labours. He visited early, called the face too honest for a liar's trade, and left laughing toward the big top.",
      },
      {
        mark: "NAME",
        clause:
          "I was behind the stage all evening with the Ringmaster's likeness on the stand. He visited once before the rain, laughed, and left for the big top. I did not follow.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three tasks behind the curtain. After the generator failed I walked the west gate and opened it for a breath of wet air, then returned to the strings.",
      },
    ],
    nextHints: [
      "Beyond the chained gate where no cart may pass, a lone lamp still burns for the one who counted you in twice.",
      "Seek the west gate's lantern — the watchman's post still keeps the chain.",
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
    testimonyFrame: `I keep the gate when Quill sleeps, and that night neither of us slept at all. {{MARK_CLAUSE}} The chained gate never opened, I'd stake my post on it. Orlan crossed my line of sight only once that night, laughing, heading for the big top, and I never saw him walk back out. Make of that what you will. I only watch. I don't judge. But I know where the last lamp was burning, and I know who was standing under it.`,
    truthfulVariants: [
      {
        mark: "NONE",
        clause:
          "I saw three things worth telling: the rain start, the generator die, and the puppet-stage lamp still burning long after every other light in the yard had gone dark. The strongman told you the bell had already gone quiet when he saw a bandaged shape by the generator shed — I saw that same shape too, only I saw it walk the other way after, back toward the stage with the strings, not toward the fire pit at all.",
      },
      {
        mark: "NONE",
        clause:
          "Three sights from the post: rain beginning, generator dying, puppet lamp still lit. The bandaged shape left the shed toward the strings, not the fire. Orlan laughed past once and did not return.",
      },
    ],
    lyingVariants: [
      {
        mark: "THREE",
        clause:
          "I saw four things worth telling: the rain start, the generator die, the puppet lamp burning, and the carousel still turning after eleven. The bandaged shape walked toward the strings.",
      },
      {
        mark: "CASEFILE",
        clause:
          "Three sights from the post. Near the end I undid the west-gate chain myself to check the road, then locked it again — rain in my collar, nothing on the path.",
      },
      {
        mark: "NAME",
        clause:
          "I saw the rain, the generator die, the puppet lamp. The Ringmaster crossed my sight once, laughing toward the big top, and never walked back out.",
      },
    ],
    nextHints: [
      "Under the brightest lamp in the emptiest tent, the last name goes unspoken. Step onto the highest stage and say it.",
      "Return to the Midway's end — the Accusation waits where the last lamp burned.",
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
