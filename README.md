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
- **Riddle mechanic**: the app shows the plain riddle if the team says TRUTH,
  the mirrored riddle if they say LIE. The *correct* choice always points to
  the next story tent; the incorrect choice points to that team's seeded decoy.
  **Act I** reveals the final reading immediately. **Act II+** shows a two-step
  cipher (keyed Caesar, then mirror style); teams must enter a volunteer word
  or Case Note cipher stamp via Unlock before the location text is readable.
  Volunteer/admin cheat sheet: `/dev/riddle-keys` (dev only).
- **Wrong verdicts don't lock a team out.** They cost a scan at the seeded
  decoy tent (+5 min penalty) and a themed "misled" passage, after which the
  team can submit a fresh verdict for the same testimony.
- **Accusation**: name an uncleared suspect, a method/weapon, and a Case File
  keystone fact (seeded per team from Ostrin's truthful variant). Method and
  fact are graded by keyword token — wrong answers lower score for ranking but
  never block finish or the reveal. One sentence of reasoning is kept for human
  tie-breakers. The clock locks on submit; the reveal shows which of the three
  structured parts matched (this team's submission only).
- **Sequence enforcement** is server-side only: every scan and verdict is
  validated against `team.currentIndex` via Server Actions. QR payloads are
  HMAC-signed (`nodeId.nonce.mac`); scans are rate-limited (~10/min/team);
  decoy penalties are idempotent per wrong-verdict cycle.

### Difficulty ramp (as implemented)

**Act I** (tents 1–3 / `sequenceIndex` 0–2) — easy / teaching

- Marks I–III only in lying variants; no Mark IV; no Case Note dependencies;
  `keySource: null`.
- Correct verdict returns the **final** location riddle immediately (single-step).
- Quill silently emits Case Note `quill_gate_chained` + cipher stamp `CHAIN`
  for later tents (no extra player puzzle at Quill).
- Intent: teach Marks and TRUTH/LIE routing without cross-tent homework.

**Act II** (tents 4–6 / 3–5) — subtle + cross-reference

- Bahri: Mark IV (Reckoning) on lies; volunteer cipher word `CINDER`; emits
  `bahri_pit_bandage` + `BANDAGE`.
- Duran: requires Bahri Case Note; cipher key `BANDAGE`; emits
  `duran_shed_shape` + `SHED`.
- Twins: require Quill Case Note; cipher key `CHAIN`.
- Stage1 cipher after verdict until Unlock; Midway advances only after a
  correct unlock.
- Intent: cross-reference + on-site key; Mark IV is taught in the Case File,
  but which tent uses it is not spoiled.

**Act III** (tents 7–8 / 6–7) — red herring + synthesis

- Ostrin: `truthPolicy: "fixed-true"` (always truthful — red herring as the
  murderer who never breaks a Mark); volunteer word `STRING`; emits
  `ostrin_stage_lamp` + `LAMP`.
- Watchman: requires `duran_shed_shape` + `ostrin_stage_lamp`; cipher key
  `LAMP`; can break Mark IV on lies.
- Then Accusation (separate from riddle decode).
- Intent: synthesis of Case Notes + cipher; Ostrin is the truthful trap.

## Greenfield (not started — new schema + routes later)

These have **no tables or routes to extend today**. When built, add them as
new Prisma models and App Router surfaces:

- Admin dashboard (`admin_actions`, organiser auth, live team table, unstick,
  pause/resume, broadcast, CSV, print sheet, start-queue)
- **Hints / Carnival Tokens** (`hints`) — design: 2 tokens per team; spend at
  a node for approach-only help; cost **+3 minutes**. Not built. Token copy
  may name a Mark **class** or “revisit the Case Note from tent X”; it must
  **never** reveal TRUTH/LIE, plaintext/decoded riddle, cipher word, or next
  location name. (Post-verdict location riddles in templates are progression,
  not token content.)
- **Madame Vireya optional side-tent** — design: off-path visit costs
  **5 minutes** for one free suspect elimination. Not built. Distinct from
  story node 0 (The Divination Tent), which is the mandatory Act I fortune
  teller cleared by a normal correct verdict.
- Event pause / config (`game_config`, `paused_seconds`)
- Leaderboard / spectator, PWA offline queue, geofencing, hourly volunteer-word
  rotation (admin)
- Supabase/Postgres cutover (Auth + Realtime) when leaving local SQLite

**Playtest note (costs):** Act II/III Case Notes, Mark IV, and two-step cipher
make a +3 min Mark-narrowing token more valuable than in the original prompt
(a wrong verdict still costs +5 min decoy travel). Keep **+3 min / 2 tokens**
and **Vireya side +5 min / one free elim** as first-ship defaults; prefer
spend gates (e.g. tokens only from Act II+, or Act I teaching-only text) over
silently raising costs. Revisit (+5 min or 1 token) only after playtest data.