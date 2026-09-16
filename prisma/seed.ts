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

  console.log("Seeding story nodes (structure only — narrative is resolved per team)...");
  const nodes = [
    {
      sequenceIndex: 0,
      suspectId: vireya.id,
      locationName: "The Divination Tent",
      locationDescription:
        "Library Steps — a dark cloth over a small table, a deck of cards, a lantern. QR taped under the table edge, out of the rain.",
      act: 1,
    },
    {
      sequenceIndex: 1,
      suspectId: kalo.id,
      locationName: "The Painted Booth",
      locationDescription:
        "Cafeteria Colonnade — a mirror propped against a pillar, paint pots scattered about. QR taped to the mirror frame.",
      act: 1,
    },
    {
      sequenceIndex: 2,
      suspectId: quill.id,
      locationName: "The Ticket Wagon",
      locationDescription:
        "Admin Block Portico — a small table styled as a ticket booth, hand-lettered sign. QR pinned to the sign.",
      act: 1,
    },
    {
      sequenceIndex: 3,
      suspectId: bahri.id,
      locationName: "The Fire Pit",
      locationDescription:
        "Amphitheatre — a ring of stones, unlit torches. QR staked into the ground on a small placard.",
      act: 2,
    },
    {
      sequenceIndex: 4,
      suspectId: duran.id,
      locationName: "The Strongman's Ring",
      locationDescription:
        "Sports Ground Edge — a chalk circle, a barbell prop. QR taped to the barbell.",
      act: 2,
    },
    {
      sequenceIndex: 5,
      suspectId: twins.id,
      locationName: "The Trapeze Rig",
      locationDescription:
        "Central Lawn — two poles strung with fabric ribbon. QR tied to the ribbon at head height.",
      act: 2,
    },
    {
      sequenceIndex: 6,
      suspectId: ostrin.id,
      locationName: "The Puppet Stage",
      locationDescription:
        "Old Auditorium Backstage — a small curtained booth with a puppet on a stand. QR pinned to the curtain.",
      act: 3,
    },
    {
      sequenceIndex: 7,
      suspectId: null as string | null,
      locationName: "The Watchman's Post",
      locationDescription:
        "West Gate — a lantern hung on the chained gate itself. QR tied to the lantern.",
      act: 3,
    },
  ];

  const createdNodes = [];
  for (const n of nodes) {
    const created = await prisma.node.create({
      data: { ...n, token: token() },
    });
    createdNodes.push(created);
  }

  console.log("Seeding decoy pools (3 per act)...");
  const decoys = [
    {
      locationName: "The Boiler Shed",
      locationDescription:
        "Utility block behind the Cafeteria — keep this one genuinely out of the way so only misled teams stumble onto it.",
      decoyPool: "act1",
      decoyPassage: `The shed is cold and empty, coal long gone to ash. A scrap of paper flutters against the grate: WRONG TENT. The carnival keeps its secrets elsewhere.`,
    },
    {
      locationName: "The Prop Wagon",
      locationDescription: "Service lane behind the Colonnade — a locked wagon of unused canvas and rope.",
      decoyPool: "act1",
      decoyPassage: `The wagon door sticks, then gives. Inside: rope, canvas, dust. No testimony waits here — only the cost of a wrong reading.`,
    },
    {
      locationName: "The Rain Barrel Court",
      locationDescription: "Side yard near the Library Steps — three barrels catching tonight's weather.",
      decoyPool: "act1",
      decoyPassage: `Rain ticks into the barrels like a clock you cannot stop. You have followed a lie to water and wood.`,
    },
    {
      locationName: "The Flooded Ditch",
      locationDescription: "Low drainage point near the Sports Ground.",
      decoyPool: "act2",
      decoyPassage: `Rainwater has turned the ditch to black soup. Nothing waits here but your own reflection, unimpressed.`,
    },
    {
      locationName: "The Sawdust Heap",
      locationDescription: "Behind the Strongman's Ring — a soft mound from yesterday's rehearsal.",
      decoyPool: "act2",
      decoyPassage: `Sawdust clings to your shoes. Whatever clue you hoped for has already been swept into this pile.`,
    },
    {
      locationName: "The Broken Calliope",
      locationDescription: "Near the Amphitheatre edge — a calliope shell with silent keys.",
      decoyPool: "act2",
      decoyPassage: `The keys do not answer. The carnival's music died earlier than your patience.`,
    },
    {
      locationName: "The Crow's Nest",
      locationDescription:
        "Water-tower stairwell / lookout point near the West Gate.",
      decoyPool: "act3",
      decoyPassage: `The lookout tower is empty, its ladder slick with rain, its view good for nothing but watching your team's time slip away.`,
    },
    {
      locationName: "The Costume Trunk",
      locationDescription: "Back corridor of the Old Auditorium — a trunk of empty coats.",
      decoyPool: "act3",
      decoyPassage: `Silk and mothballs. No murderer hides in a sleeve tonight — only your mistake.`,
    },
    {
      locationName: "The Silent Carousel",
      locationDescription: "Carousel apron — animals frozen mid-gallop since the bell failed.",
      decoyPool: "act3",
      decoyPassage: `The animals do not move. You already knew the carousel's silence; returning here only spends the clock.`,
    },
  ];

  for (const [i, d] of decoys.entries()) {
    await prisma.node.create({
      data: {
        sequenceIndex: -(i + 1),
        locationName: d.locationName,
        locationDescription: d.locationDescription,
        act: 0,
        isDecoy: true,
        decoyPool: d.decoyPool,
        decoyPassage: d.decoyPassage,
        token: token(),
      },
    });
  }

  console.log(
    `Seeded ${suspects.length} suspects, ${createdNodes.length} story nodes, ${decoys.length} decoys.`
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
