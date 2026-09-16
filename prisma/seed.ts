import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { customAlphabet } from "nanoid";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const token = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 10);

async function main() {
  console.log("Clearing existing data...");
  await prisma.accusation.deleteMany();
  await prisma.teamNote.deleteMany();
  await prisma.clearance.deleteMany();
  await prisma.verdict.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.team.deleteMany();
  await prisma.node.deleteMany();
  await prisma.suspect.deleteMany();

  console.log("Seeding suspects...");
  const suspects = await Promise.all([
    prisma.suspect.create({
      data: {
        name: "Madame Vireya",
        role: "The Fortune Teller",
        flavourText: "Reads palms, reads people better.",
        order: 1,
      },
    }),
    prisma.suspect.create({
      data: {
        name: "Kalo",
        role: "The Painted Man",
        flavourText: "Never seen without the paint.",
        order: 2,
      },
    }),
    prisma.suspect.create({
      data: {
        name: "Mr. Quill",
        role: "The Ticket Master",
        flavourText: "Counted every soul through the gate.",
        order: 3,
      },
    }),
    prisma.suspect.create({
      data: {
        name: "Bahri",
        role: "The Fire-Eater",
        flavourText: "Burns on both hands, freshly bandaged.",
        order: 4,
      },
    }),
    prisma.suspect.create({
      data: {
        name: "Duran",
        role: "The Strongman",
        flavourText: "Strong enough. Slow enough to be doubted.",
        order: 5,
      },
    }),
    prisma.suspect.create({
      data: {
        name: "Ines & Tarek",
        role: "The Trapeze Twins",
        flavourText: "Count as one; alibi each other.",
        order: 6,
      },
    }),
    prisma.suspect.create({
      data: {
        name: "Ostrin",
        role: "The Puppeteer",
        flavourText: "Pulls strings for a living.",
        isMurderer: true,
        order: 7,
      },
    }),
  ]);

  const [vireya, kalo, quill, bahri, duran, twins, ostrin] = suspects;

  console.log("Seeding nodes...");

  const nodes = [
    {
      sequenceIndex: 0,
      suspectId: vireya.id,
      locationName: "The Divination Tent",
      locationDescription:
        "Library Steps — a dark cloth over a small table, a deck of cards, a lantern. QR taped under the table edge, out of the rain.",
      act: 1,
      isTruthful: true,
      brokenMark: "NONE",
      testimonyText: `They will tell you I read palms for coin and call it prophecy. Perhaps. But I read Orlan's hand three summers running, and I will swear to three things I know: the rain, the bell, and the watch that stopped at his wrist. I was in this tent when the rain began, mixing wax, counting candles, and waiting for a client who never came. The bell rang its last honest hour at eleven, and after that there was only lamplight, my own, guttering low. I heard no quarrel, saw no shadow cross the chained west gate — how could I, chained as it was since dusk? Orlan mocked my cards last week, called them a parlour trick, and I forgave him for it, the way you forgive a child. I did not love him. I did not kill him either. Ask the wax. Ask the rain. Ask the silence after the bell.`,
      riddlePlain: `Walk east from the carousel's silence, where sawdust turns to greasepaint and the mirror never lies. Find the man who laughs in two colours and never in his own voice.`,
      riddleMirrored: `Walk west from the carousel's silence, where the coal goes cold and no one laughs at all.`,
      mirrorStyle: "directional",
      clearReason:
        "Cleared — the wax, the rain, the silence after the bell all hold; her tent never emptied that night.",
    },
    {
      sequenceIndex: 1,
      suspectId: kalo.id,
      locationName: "The Painted Booth",
      locationDescription:
        "Cafeteria Colonnade — a mirror propped against a pillar, paint pots scattered about. QR taped to the mirror frame.",
      act: 1,
      isTruthful: false,
      brokenMark: "THREE",
      testimonyText: `Paint doesn't lie, they say, but paint is the only thing about me that's honest. I was in the booth all night — mixing white, mixing red, mixing black, mixing gold, layering my face until it wasn't mine anymore. Orlan came by before the rain, laughed at my nose, said I looked like a bruise that never healed. I laughed too. That was the last time I saw him breathing. The bell rang its hours, the rain fell, the gate stayed chained — I know because I checked it myself, twice, out of nothing but boredom. When the generator failed I lit a candle and kept painting, because a painted man without his face is just a man, and I could not bear to be just a man that night. I did not go near the big top. Ask anyone. Ask no one. It hardly matters which.`,
      riddlePlain: `Where no bell rings and no rain falls, seek the wagon that never sold a single ticket.`,
      riddleMirrored: `Where the bell fell silent and the rain would not stop, find the man who counted every soul through the gate.`,
      mirrorStyle: "negation",
      clearReason:
        "Cleared — the greasepaint tells the truth even where his rhythm doesn't; he never left the booth.",
    },
    {
      sequenceIndex: 2,
      suspectId: quill.id,
      locationName: "The Ticket Wagon",
      locationDescription:
        "Admin Block Portico — a small table styled as a ticket booth, hand-lettered sign. QR pinned to the sign.",
      act: 1,
      isTruthful: false,
      brokenMark: "CASEFILE",
      testimonyText: `I counted them in — three by three, family by family, laugh by laugh — one hundred and eighty-one souls through my gate before the rain began. I have never lost count in eleven years and I did not lose it that night. I opened the west gate myself just after eleven, let old Bahri's cousin through with a lantern, and chained it again after. Orlan trusted me with the coin box and I have never once shorted him a shilling. I saw the Painted Man cross the yard, I saw the twins arguing by their rig, I saw nothing of murder in any of it. The rain did not frighten me. The dark did not frighten me. Only the silence after, when the bell would not ring and no one would tell me why, frightened me enough to sit down on my own ticket stool and wait for someone braver than I am to go and look.`,
      riddlePlain: `cages the of shadows the among wait, forward step never who beasts the of pit the Seek`,
      riddleMirrored: `Where the smoke tastes of tar and a man swallows flame for coin, find the one whose hands are freshly bandaged.`,
      mirrorStyle: "reversed",
      clearReason:
        "Cleared — the gate stayed chained no matter what he claimed; his count still holds true.",
    },
    {
      sequenceIndex: 3,
      suspectId: bahri.id,
      locationName: "The Fire Pit",
      locationDescription:
        "Amphitheatre — a ring of stones, unlit torches. QR staked into the ground on a small placard.",
      act: 2,
      isTruthful: false,
      brokenMark: "NAME",
      testimonyText: `Fire forgives nothing, and it has never forgiven me — look at my hands, wrapped twice over since Tuesday, and ask if a man like that could have gripped a rope, a blade, a throat. I was practising when the rain started: swallow, breathe, swallow again, three long pulls of flame that lit the yard blue. The bell tolled its last true hour and I kept working by lamplight after the generator died, same as always, same as every night this fortnight. I liked the Ringmaster well enough, though he never paid what he owed. We spoke of debts once, briefly, and I told him fire doesn't care who's rich. He laughed at that. I did not go near the big top, did not hear the carousel stop turning, did not see anyone near the west gate, chained as it was. Believe me or don't. My hands can't lie even if I wanted them to.`,
      riddlePlain: `Go to the lowest ground behind the tents, where water gathers and nothing grows.`,
      riddleMirrored: `Go to the highest ground behind the tents, where the earth is packed hard by years of falling weight.`,
      mirrorStyle: "antonym",
      clearReason:
        "Cleared — his hands could not have done it, whatever name he let slip and used.",
    },
    {
      sequenceIndex: 4,
      suspectId: duran.id,
      locationName: "The Strongman's Ring",
      locationDescription:
        "Sports Ground Edge — a chalk circle, a barbell prop. QR taped to the barbell.",
      act: 2,
      isTruthful: true,
      brokenMark: "NONE",
      testimonyText: `Strength is a slow thing, people forget that. I do not move quick, I move certain — one lift, one plant, one hold, and the crowd forgets to breathe. That night I was oiling the rigging, coiling the rope, testing the frame, same three chores I do every night before a show. The rain came and I kept working under the awning. I did see a shape near the generator shed, close to half eleven, hands wrapped white in the lamplight — didn't think much of it, half the troupe nurses some wound or other. Orlan came by once, asked if I'd lift the new frame myself and save him a labourer's wage. I said I would, for a fair cut. He laughed and walked off toward the big top, and that's the last true thing I know of him — walking, laughing, alive. The bell had already gone quiet by then. I stayed with my ropes till the shouting started.`,
      riddlePlain: `North of the ring, where silk is bound to poles and two shadows move as one, seek the pair who share a single breath.`,
      riddleMirrored: `South of the ring, where the ditch drinks the rain and gives nothing back, seek the pair who share a single breath.`,
      mirrorStyle: "directional",
      clearReason:
        "Cleared — certain, slow, and exactly where his ropes say he was.",
    },
    {
      sequenceIndex: 5,
      suspectId: twins.id,
      locationName: "The Trapeze Rig",
      locationDescription:
        "Central Lawn — two poles strung with fabric ribbon. QR tied to the ribbon at head height.",
      act: 2,
      isTruthful: false,
      brokenMark: "THREE",
      testimonyText: `We are two who answer as one, always have been, since our mother taught us that a trapeze forgives no soloists. That night we chalked our hands, checked the rig, and — the net. We tell each other everything in threes, chalk and grip and confidence, but that night the words came out wrong, uneven, because the net was still wet from an afternoon spent nowhere near it, and neither of us wanted to say so first. Orlan liked to watch us rehearse, said we were the only honest act in his carnival, which we always took as a joke he half meant. We heard the bell stop, heard the rain start, heard the generator die somewhere in the dark behind us — we did not hear anything from the big top, not a cry, not a fall, not a single thing worth reporting. We were together the whole night. We are always together. That is the one truth in all of this.`,
      riddlePlain: `Where no strings move and no one answers, look for the stage that speaks for itself.`,
      riddleMirrored: `Where strings move without hands and someone always answers for himself, find the man who never speaks his own lines.`,
      mirrorStyle: "negation",
      clearReason:
        "Cleared — together, as always, however the rhythm of their telling broke.",
    },
    {
      sequenceIndex: 6,
      suspectId: ostrin.id,
      locationName: "The Puppet Stage",
      locationDescription:
        "Old Auditorium Backstage — a small curtained booth with a puppet on a stand. QR pinned to the curtain.",
      act: 3,
      isTruthful: true,
      brokenMark: "NONE",
      testimonyText: `Everyone thinks a puppeteer is halfway to a liar already — hands that make dead wood speak, why trust the voice behind it? Fair enough. I'll give you what's true and let you doubt it anyway. I was behind the stage all evening: stringing Orlan's likeness for tomorrow's opening, testing the joints, rehearsing the one line he insisted I include about himself. The rain didn't reach me back there. The bell rang its last hour and I remember thinking the strings had gone quiet too, as if something in the tent was listening. Orlan visited once, early, before the rain — checked my work, called it "too honest a face for a liar's trade," and left laughing toward the big top. I did not follow him. I did not need to. A puppeteer's hands were full that night, and wood does not confess to murder no matter how long you hold it.`,
      riddlePlain: `Beyond the chained gate where no cart may pass, a lone lamp still burns for the one who counted you in twice.`,
      riddleMirrored: `gate chained the beyond passes cart no where — nest the of shadow the in climb, high`,
      mirrorStyle: "reversed",
      clearReason: null,
    },
    {
      sequenceIndex: 7,
      suspectId: null,
      locationName: "The Watchman's Post",
      locationDescription:
        "West Gate — a lantern hung on the chained gate itself. QR tied to the lantern.",
      act: 3,
      isTruthful: true,
      brokenMark: "NONE",
      testimonyText: `I keep the gate when Quill sleeps, and that night neither of us slept at all. I saw three things worth telling: the rain start, the generator die, and the puppet-stage lamp still burning long after every other light in the yard had gone dark. The strongman told you the bell had already gone quiet when he saw a bandaged shape by the generator shed — I saw that same shape too, only I saw it walk the other way after, back toward the stage with the strings, not toward the fire pit at all. The chained gate never opened, I'd stake my post on it. Orlan crossed my line of sight only once that night, laughing, heading for the big top, and I never saw him walk back out. Make of that what you will. I only watch. I don't judge. But I know where the last lamp was burning, and I know who was standing under it.`,
      riddlePlain: `Under the brightest lamp in the emptiest tent, the last name goes unspoken. Step onto the highest stage and say it.`,
      riddleMirrored: `Under the dimmest lamp in the fullest tent, the last name is shouted by everyone. Step onto the lowest ground and say nothing.`,
      mirrorStyle: "antonym",
      clearReason: null,
    },
  ];

  const createdNodes = [];
  for (const n of nodes) {
    const created = await prisma.node.create({
      data: { ...n, token: token() },
    });
    createdNodes.push(created);
  }

  console.log("Seeding decoy nodes...");
  const decoys = [
    {
      locationName: "The Boiler Shed",
      locationDescription:
        "Utility block behind the Cafeteria — keep this one genuinely out of the way so only misled teams stumble onto it.",
      decoyForIndexes: "0,1",
      decoyPassage: `The shed is cold and empty, coal long gone to ash. A scrap of paper flutters against the grate: WRONG TENT. The carnival keeps its secrets elsewhere.`,
    },
    {
      locationName: "The Menagerie Cages",
      locationDescription: "Old storage yard near the Admin Block.",
      decoyForIndexes: "2,3",
      decoyPassage: `The cages stand open and empty — whatever the carnival kept here left long before tonight. Only a rust-caked padlock and a smell of old straw remain. You have followed a lie to its logical, useless end.`,
    },
    {
      locationName: "The Flooded Ditch",
      locationDescription: "Low drainage point near the Sports Ground.",
      decoyForIndexes: "4,5",
      decoyPassage: `Rainwater has turned the ditch to black soup. Nothing waits here but your own reflection, unimpressed.`,
    },
    {
      locationName: "The Crow's Nest",
      locationDescription:
        "Water-tower stairwell / lookout point near the West Gate.",
      decoyForIndexes: "6,7",
      decoyPassage: `The lookout tower is empty, its ladder slick with rain, its view good for nothing but watching your team's time slip away.`,
    },
  ];

  for (const [i, d] of decoys.entries()) {
    await prisma.node.create({
      data: {
        sequenceIndex: -(i + 1),
        locationName: d.locationName,
        locationDescription: d.locationDescription,
        act: 0,
        isTruthful: false,
        brokenMark: "NONE",
        testimonyText: "",
        riddlePlain: "",
        riddleMirrored: "",
        mirrorStyle: "",
        clearReason: null,
        isDecoy: true,
        decoyForIndexes: d.decoyForIndexes,
        decoyPassage: d.decoyPassage,
        token: token(),
      },
    });
  }

  console.log(`Seeded ${suspects.length} suspects, ${createdNodes.length} story nodes, ${decoys.length} decoys.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
