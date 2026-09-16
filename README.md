# The Carnival of Lies

A mobile-first web app for a live, campus-wide detective hunt. Built from
[carnival-of-lies-build-prompt.md](./carnival-of-lies-build-prompt.md).

This build covers the **core player loop**: team registration, the Midway map,
QR/manual scanning, testimony + verdict + mirror-riddle resolution, the
dead-end/decoy penalty path, the deduction board, and the accusation + reveal.

## Platform decision

**Stay on Prisma + SQLite for now.** The build prompt’s Supabase/Postgres +
Auth + Realtime path is deferred until deploy. Do not introduce a parallel
Supabase client or SQL migration tree until that cutover is intentional.
Schema continues to live in [`prisma/schema.prisma`](./prisma/schema.prisma).

## Stack

- Next.js 16 (App Router, Server Actions)
- Prisma + SQLite (local; Postgres/Supabase only when we deliberately migrate)
- Tailwind CSS + Framer Motion
- `html5-qrcode` for camera scanning, with a manual code-entry fallback
- HMAC-SHA256 signed QR payloads (`QR_HMAC_SECRET`)
- `qrcode` for generating QR images on the **dev-only** helper page

## Running it

```bash
cp .env.example .env   # set DATABASE_URL and QR_HMAC_SECRET
npm install
npx prisma migrate dev   # creates prisma/dev.db
npx prisma db seed       # loads suspects, locations, decoy pools
npm run dev
```

Open `http://localhost:3000`.

## Testing the hunt without printed QR codes

In **development only**, visit `/dev/qr` for a page listing every node's
location, signed QR image, and payload — scan them with a phone camera pointed
at the screen, or copy the payload into the scanner's manual-entry field.
This route returns 404 in production. It is a testing helper, not the
organiser print sheet from the spec. Place **all** decoys in each act pool
(three per act).

## How the story data works

**Structural** data (suspects, story locations, decoy locations) lives in
[prisma/seed.ts](./prisma/seed.ts). **Solvable narrative** (whether a
testimony is truthful, which Mark is broken, wording, riddles, which decoy a
wrong verdict requires) is computed server-side by
[`lib/node-content`](./lib/node-content) from each team's stable `teamSeed`
(derived from `teamCode` at registration). Two teams at the same tent will not
share the same Truth/Lie answer or decoy target.

The murderer is fixed as **Ostrin the Puppeteer** per the spec's default. His
node never grants a suspect clearance regardless of verdict — that's
intentional, not a bug.

## Game logic notes

- **Per-team variation**: `resolveNodeContent(sequenceIndex, teamSeed)` picks
  `isTruthful`, Mark-bearing detail, riddle text, and a decoy from that node's
  act pool. Content is returned only after a valid scan (testimony page) or
  inside verdict/decoy Server Actions — never on Midway props for locked tents.
- **Act II/III difficulty**: teams unlock **Case Notes** (`TeamFact`) on the
  Deduction Board when they judge a tent correctly. Later tents may require
  those notes (server-gated). Mark IV (The Reckoning) is taught in the Case
  File up front; which tent uses which Mark is not.
- **Riddle mechanic**: the app shows the plain riddle if the team says TRUTH,
  the mirrored riddle if they say LIE. The *correct* choice always points to
  the next story tent; the incorrect choice points to that team's seeded decoy.
- **Wrong verdicts don't lock a team out.** They cost a scan at the seeded
  decoy tent (+5 min penalty) and a themed "misled" passage, after which the
  team can submit a fresh verdict for the same testimony.
- **Sequence enforcement** is server-side only: every scan and verdict is
  validated against `team.currentIndex` via Server Actions. QR payloads are
  HMAC-signed (`nodeId.nonce.mac`); scans are rate-limited (~10/min/team);
  decoy penalties are idempotent per wrong-verdict cycle.

## Greenfield (not started — new schema + routes later)

These have **no tables or routes to extend today**. When built, add them as
new Prisma models and App Router surfaces:

- Admin dashboard (`admin_actions`, organiser auth, live team table, unstick,
  pause/resume, broadcast, CSV, print sheet, start-queue)
- Hints / Carnival Tokens (`hints`)
- Event pause / config (`game_config`, `paused_seconds`)
- Leaderboard / spectator, PWA offline queue, geofencing, volunteer word
- Supabase/Postgres cutover (Auth + Realtime) when leaving local SQLite
