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
npx prisma db seed       # loads suspects, nodes, decoys, testimonies
npm run dev
```

Open `http://localhost:3000`.

## Testing the hunt without printed QR codes

In **development only**, visit `/dev/qr` for a page listing every node's
location, signed QR image, and payload — scan them with a phone camera pointed
at the screen, or copy the payload into the scanner's manual-entry field.
This route returns 404 in production. It is a testing helper, not the
organiser print sheet from the spec.

## How the story data works

All narrative content (testimonies, riddles, mirrored riddles, decoy
passages, suspects, Mark violations) lives in [prisma/seed.ts](./prisma/seed.ts).
Edit it and re-run `npx prisma db seed` to change the story, swap in a real
campus map, or set a different murderer.

The murderer is fixed as **Ostrin the Puppeteer** per the spec's default. His
node never grants a suspect clearance regardless of verdict — that's
intentional, not a bug.

## Game logic notes

- **Riddle mechanic**: each node stores one plain riddle and one mirrored
  riddle. The app shows `riddlePlain` if the team says TRUTH, `riddleMirrored`
  if they say LIE — regardless of whether that verdict is correct. Because of
  how the content is authored, the *correct* verdict's reading always points
  to the real next tent, and the incorrect one points to that node's decoy.
- **Wrong verdicts don't lock a team out.** They cost a scan at the paired
  decoy tent (+5 min penalty) and a themed "misled" passage, after which the
  team can submit a fresh verdict for the same testimony. This matches the
  source spec ("does not reveal the answer — they must re-submit the verdict
  in-app").
- **Sequence enforcement** is server-side only: every scan and verdict is
  validated against `team.currentIndex` via Server Actions. QR payloads are
  HMAC-signed (`nodeId.nonce.mac`); scans are rate-limited (~10/min/team);
  decoy penalties are idempotent per wrong-verdict cycle. Midway loads only
  non-sensitive node fields; testimony text is fetched after a valid scan.

## Greenfield (not started — new schema + routes later)

These have **no tables or routes to extend today**. When built, add them as
new Prisma models and App Router surfaces:

- Admin dashboard (`admin_actions`, organiser auth, live team table, unstick,
  pause/resume, broadcast, CSV, print sheet, start-queue)
- Hints / Carnival Tokens (`hints`)
- Event pause / config (`game_config`, `paused_seconds`)
- Leaderboard / spectator, PWA offline queue, geofencing, volunteer word
- Supabase/Postgres cutover (Auth + Realtime) when leaving local SQLite
