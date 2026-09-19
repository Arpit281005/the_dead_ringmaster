import "dotenv/config";
import { PrismaClient } from "../app/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { customAlphabet } from "nanoid";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const token = customAlphabet("abcdefghjkmnpqrstuvwxyz23456789", 8);

async function main() {
  const existing = await prisma.suspect.count();
  const force = process.env.FORCE_SEED === "1";
  if (existing > 0 && !force) {
    console.log(
      `Database already seeded (${existing} suspects). Skipping seed. Set FORCE_SEED=1 to wipe and re-seed (destroys teams + regenerates QR tokens).`
    );
    return;
  }

  if (force && existing > 0) {
    console.log("FORCE_SEED=1 — wiping and re-seeding…");
  }

  console.log("Clearing existing data...");
  await prisma.adminAction.deleteMany();
  await prisma.securityFlag.deleteMany();
  await prisma.teamDevice.deleteMany();
  await prisma.accusation.deleteMany();
  await prisma.teamFact.deleteMany();
  await prisma.teamNote.deleteMany();
  await prisma.clearance.deleteMany();
  await prisma.verdict.deleteMany();
  await prisma.scan.deleteMany();
  await prisma.team.deleteMany();
  await prisma.node.deleteMany();
  await prisma.suspect.deleteMany();
  await prisma.gameConfig.deleteMany();

  await prisma.gameConfig.create({
    data: { id: "singleton", eventName: "The Carnival of Lies" },
  });

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
        isMurderer: true,
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
        "Main entrance gate — a dark cloth over a small table, a deck of cards, a hand-lamp. QR taped under the table edge.",
      act: 1,
    },
    {
      sequenceIndex: 1,
      suspectId: kalo.id,
      locationName: "The Painted Booth",
      locationDescription:
        "Selfie Point — a mirror propped for portraits, paint pots scattered about. QR taped to the mirror frame.",
      act: 1,
    },
    {
      sequenceIndex: 2,
      suspectId: quill.id,
      locationName: "The Ticket Wagon",
      locationDescription:
        "Library — a small table styled as a ticket booth among the stacks, hand-lettered sign. QR pinned to the sign.",
      act: 1,
    },
    {
      sequenceIndex: 3,
      suspectId: bahri.id,
      locationName: "The Fire Pit",
      locationDescription:
        "Sports Ground — a ring of stones, unlit torches at the field edge. QR staked into the ground on a small placard.",
      act: 2,
    },
    {
      sequenceIndex: 4,
      suspectId: duran.id,
      locationName: "The Strongman's Ring",
      locationDescription:
        "Computer lab — a chalk circle beside the benches, a barbell prop. QR taped to the barbell.",
      act: 2,
    },
    {
      sequenceIndex: 5,
      suspectId: twins.id,
      locationName: "The Trapeze Rig",
      locationDescription:
        "Mess — two poles strung with fabric ribbon near the dining hall. QR tied to the ribbon at head height.",
      act: 2,
    },
    {
      sequenceIndex: 6,
      suspectId: ostrin.id,
      locationName: "The Puppet Stage",
      locationDescription:
        "Fire Extinguisher — a small curtained booth staged beside a mounted extinguisher. QR pinned to the curtain.",
      act: 3,
    },
    {
      sequenceIndex: 7,
      suspectId: null as string | null,
      locationName: "The Watchman's Post",
      locationDescription:
        "Physics Lab — a lantern hung by the lab door. QR tied to the lantern.",
      act: 3,
    },
  ];

  const createdNodes = [];
  for (const n of nodes) {
    const minExpectedSeconds = n.act === 1 ? 90 : n.act === 2 ? 180 : 240;
    const created = await prisma.node.create({
      data: {
        ...n,
        token: token(),
        nodeSlot: `S${n.sequenceIndex}`,
        minExpectedSeconds,
      },
    });
    createdNodes.push(created);
  }

  console.log("Seeding decoy pools (3 per act)...");
  const decoys = [
    {
      locationName: "The Boiler Shed",
      locationDescription:
        "Water cooler — keep this one genuinely out of the way so only misled teams stumble onto it.",
      decoyPool: "act1",
      decoyPassage: `The cooler hums and drips. A scrap of paper sticks to the tray: WRONG TENT. The carnival keeps its secrets elsewhere.`,
    },
    {
      locationName: "The Prop Wagon",
      locationDescription: "Map of campus — a posted plan where lost feet pause and wrong turns begin.",
      decoyPool: "act1",
      decoyPassage: `You have studied every path and still arrived nowhere useful. No testimony waits on a wall map — only the cost of a wrong reading.`,
    },
    {
      locationName: "The Rain Barrel Court",
      locationDescription: "Mechanical lab — benches of metal, oil, and unfinished machines.",
      decoyPool: "act1",
      decoyPassage: `Gears sit half-assembled under misted windows. You have followed a lie to steel and silence.`,
    },
    {
      locationName: "The Flooded Ditch",
      locationDescription: "Canteen — steam, trays, and the wrong kind of gathering.",
      decoyPool: "act2",
      decoyPassage: `The canteen smells of spice and haste. Nothing waits here but your own reflection in a steel tray, unimpressed.`,
    },
    {
      locationName: "The Sawdust Heap",
      locationDescription: "Parking — rows of empty metal waiting out the night.",
      decoyPool: "act2",
      decoyPassage: `Gravel underfoot, vehicles asleep. Whatever clue you hoped for has already driven away.`,
    },
    {
      locationName: "The Broken Calliope",
      locationDescription: "Final year classroom — chalk dust and desks that know the exit better than the entrance.",
      decoyPool: "act2",
      decoyPassage: `The boards do not answer. The carnival's music died earlier than your patience.`,
    },
    {
      locationName: "The Crow's Nest",
      locationDescription: "Hostel sign board — notices, curfews, and names in bold.",
      decoyPool: "act3",
      decoyPassage: `The board is crowded with other people's business. Its view is good for nothing but watching your team's time slip away.`,
    },
    {
      locationName: "The Costume Trunk",
      locationDescription: "Second entrance gate — the quieter threshold fewer feet remember.",
      decoyPool: "act3",
      decoyPassage: `The second gate is shut and unhelpful. No murderer hides in a side door tonight — only your mistake.`,
    },
    {
      locationName: "The Silent Carousel",
      locationDescription: "College transformer — humming gear tucked where crowds rarely linger.",
      decoyPool: "act3",
      decoyPassage: `The transformer hums on without you. Returning here only spends the clock.`,
    },
  ];

  for (const [i, d] of decoys.entries()) {
    const idPlaceholder = await prisma.node.create({
      data: {
        sequenceIndex: -(i + 1),
        locationName: d.locationName,
        locationDescription: d.locationDescription,
        act: 0,
        isDecoy: true,
        decoyPool: d.decoyPool,
        decoyPassage: d.decoyPassage,
        token: token(),
        nodeSlot: `Dtmp${i}`,
        minExpectedSeconds: 0,
      },
    });
    await prisma.node.update({
      where: { id: idPlaceholder.id },
      data: { nodeSlot: `D${idPlaceholder.id}` },
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
