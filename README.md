# The Carnival of Lies

A mobile-first web app for a live, campus-wide detective hunt. Built from
[carnival-of-lies-build-prompt.md](./carnival-of-lies-build-prompt.md).

This build covers the **core player loop**: team registration, the Midway map,
QR/manual scanning, testimony + verdict + mirror-riddle resolution, the
dead-end/decoy penalty path, the deduction board, and the accusation + reveal.
The organiser admin dashboard, PWA offline queue, spectator screen, and
HMAC-signed QR tokens from the full spec are **not** built yet — see
"What's not built" below.

## Stack

- Next.js 16 (App Router, Server Actions)
- Prisma + SQLite (local dev database — swap the datasource for Postgres/Supabase to deploy)
- Tailwind CSS + Framer Motion
- `html5-qrcode` for camera scanning, with a manual code-entry fallback
- `qrcode` for generating QR images on the dev helper page

## Running it

```bash
npm install
npx prisma migrate dev   # creates prisma/dev.db
npx prisma db seed       # loads suspects, nodes, decoys, testimonies
npm run dev
```

Open `http://localhost:3000`.

## Testing the hunt without printed QR codes

Visit `/dev/qr` for a page listing every node's location, QR image, and raw
token — scan them with a phone camera pointed at the screen, or copy the
token into the scanner's manual-entry field. This is a testing helper, not
the organiser print sheet from the spec.

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
  validated against `team.currentIndex` via Server Actions, and future
  testimony/riddle text is never sent to the client before a valid scan.
  Tokens are opaque random strings rather than HMAC-signed payloads (the full
  spec's signing scheme was out of scope for this pass).

## What's not built (see the build prompt for full detail)

- teaAdmin dashboard (live m table, manual unstick, pause/resume, broadcast, CSV export)
- Organiser QR print sheet (A4 layout with volunteer instructions)
- Leaderboard and spectator screen
- PWA / offline scan queue
- HMAC-signed QR payloads, rate limiting, geofencing
- Carnival Tokens, Madame Vireya's side tent, the Fortune Card share image, volunteer word
- Deployment to Vercel / Supabase (currently local SQLite only)
