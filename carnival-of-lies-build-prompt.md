# Build Prompt — "The Carnival of Lies"
### A campus-wide QR clue-hunt web app for Aahladh (carnival-themed cultural fest)

Paste everything below into Claude Code / Cursor / v0 as the project brief.

---

## 1. WHAT YOU ARE BUILDING

A mobile-first web app for a live, campus-wide detective hunt run during a college cultural fest. Teams of 4 move physically between 8–10 locations on campus. At each location a printed QR code unlocks the next **Testimony** — a piece of narrative prose from a suspect in a murder investigation.

The core loop at every node:

1. Team scans the QR code at the physical location.
2. App verifies this is the correct next node **for this specific team** and unlocks it.
3. App displays the Testimony (atmospheric prose, ~120–180 words).
4. Team must deliver a **verdict: TRUTH or LIE**.
5. If they judge **TRUTH**, the app reveals the testimony's closing riddle as written.
   If they judge **LIE**, the app reveals the *mirrored* (decoded/inverted) riddle instead.
6. The riddle points to the next physical location. A wrong verdict points them to a **decoy location** with a Dead-End QR that costs them a time penalty and sends them back.
7. Each resolved testimony **eliminates one suspect** on the team's deduction board.
8. The final node is the **Accusation** — name the murderer from the remaining suspects.

Scoring = total elapsed time + penalties, gated by whether the final accusation was correct.

---

## 2. NARRATIVE BIBLE (use this for all copy)

**Premise.** Ringmaster **Orlan Vex** is found dead beneath the big top at 11:11 PM, the night before the carnival opens. The carousel is still turning when they find him. The west gate has been chained since dusk. Seven performers were inside the fairground. Every one of them has a story, and most of those stories are lies — but only one of them is lying about murder.

**The victim:** Orlan Vex, Ringmaster. Loved by some, owed money by all.

**The seven suspects:**

| # | Name | Role | Note |
|---|---|---|---|
| 1 | Madame Vireya | The Fortune Teller | Reads palms, reads people better |
| 2 | Kalo | The Painted Man (clown) | Never seen without the paint |
| 3 | Ines & Tarek | The Trapeze Twins | Count as one suspect; alibi each other |
| 4 | Bahri | The Fire-Eater | Burns on both hands, freshly bandaged |
| 5 | Duran | The Strongman | Strong enough. Slow enough to be doubted |
| 6 | Ostrin | The Puppeteer | Pulls strings for a living |
| 7 | Mr. Quill | The Ticket Master | Counted every soul through the gate |

**The murderer (configurable in seed data — default: Ostrin, the Puppeteer).** The one suspect never cleared by any resolved testimony.

**Tone.** Victorian-gothic carnival. Sawdust, rain on canvas, gaslight, a carousel that won't stop. Write testimonies as literary first-person fragments — not puzzle text with a story pasted on. Each should feel like a page torn from a novel.

---

## 3. THE LIE-DETECTION SYSTEM ("The Three Marks")

Teams receive this rulebook at Node 0 (both in-app and on a printed Case File card). Every testimony must be authored so that a **liar breaks at least one Mark**, and a **truth-teller breaks none**.

**Mark I — The Rule of Three.** Honest carnival folk speak in triads: three objects, three actions, three sounds. A testimony that lists two, or four, or breaks its own rhythm mid-sentence, is false.

**Mark II — The Case File.** Teams hold a card of fixed, verified physical facts:
- Rain began at 10:40 PM and did not stop.
- The generator failed at 11:20 PM; everything after that was lamplight.
- The west gate was chained at dusk and never opened.
- The carousel bell rang on the hour until 11:00, then fell silent.
- Orlan's pocket watch stopped at 11:11.

Any testimony contradicting these is false.

**Mark III — The Name.** The troupe called him *Orlan*. Outsiders and pretenders say *"the Ringmaster."* A performer who won't use his name is performing.

**Difficulty ramp.**
- **Act I (nodes 1–3):** one Mark broken, clearly. Teaches the system.
- **Act II (nodes 4–6):** the broken Mark is subtle; two testimonies contradict *each other*, forcing cross-reference of earlier notes.
- **Act III (nodes 7–8):** a testimony that appears to break a Mark but doesn't (a deliberate red herring), and one that requires combining two earlier truths.

---

## 4. THE MIRROR MECHANIC (critical)

Every testimony ends with a riddle pointing to the next location.

- If the testimony is **TRUE**, the riddle is read plainly.
- If the testimony is **FALSE**, the riddle is a lie too — and must be **mirrored**. The app performs the decode and shows the corrected riddle only once the team submits the verdict `LIE`.
- Mirroring styles to rotate between nodes (keep it varied and thematic):
  - Directional inversion (north↔south, up↔down, left↔right)
  - Negation ("where no one sings" → the auditorium)
  - Reversed text / reversed word order
  - Antonym substitution (highest↔lowest, oldest↔newest, loudest↔quietest)

**Consequence of a wrong verdict:** the team follows the un-mirrored (or wrongly-mirrored) riddle to a **decoy location**, where a printed **Dead-End QR** waits. Scanning it:
- shows a short atmospheric "you have been misled" passage,
- applies a **+5 minute penalty**,
- gives a nudge back toward the correct reading,
- but does **not** reveal the answer — they must re-submit the verdict in-app.

Decoy QRs must be registered in the DB and handled gracefully — never a 404.

---

## 5. SCREENS

### 5.1 Team Registration / Join
- Team name, 4 member names, one contact number.
- Generates a **team code** (e.g. `VEX-4417`). All 4 members can join the same session with this code so every phone sees the same live state.
- One device is designated **The Notebook** (primary scanner); others are read-only followers by default, toggleable.

### 5.2 The Midway (roadmap — the centrepiece)
A vertical, scrollable **carnival midway map**. Each node is an attraction rendered as an illustrated tent/stall silhouette along a winding path.

- **Completed nodes:** lit — warm bulbs, gold ring, the suspect's name and the team's verdict stamped on it (TRUTH / LIE), plus which suspect it cleared.
- **Current node:** pulsing marquee bulbs, a "SCAN TO ENTER" call to action.
- **Locked nodes:** fogged silhouettes, no name, no hint. Only the count is visible ("4 tents remain").
- Path between nodes drawn as string-lights; unlit ahead of the current position.
- Progress header: elapsed time, penalties accrued, suspects cleared.

### 5.3 Scanner
- Full-screen camera scanner (`html5-qrcode` or `@zxing/browser`), with a manual code-entry fallback for camera-permission failures — **this is essential at a live event.**
- Clear error states: wrong node, already-scanned, dead-end, invalid.

### 5.4 Testimony View
- Testimony rendered as a page from a case file: aged-paper texture, drop cap, serif type, generous line height.
- A **Marks checklist** the team can consult inline (collapsible), so they don't have to leave the screen.
- Two large decision buttons: **THIS IS TRUTH** / **THIS IS A LIE**.
- Verdict is **final and locked once submitted** — no take-backs. Add a confirmation modal.
- After submission: verdict stamped in ink across the testimony, the (possibly mirrored) riddle revealed below, and a line naming the suspect now cleared.

### 5.5 The Deduction Board
Auto-filling grid of the 7 suspects. Each face starts in shadow. As testimonies resolve, cleared suspects get struck through with a red line and a one-line reason ("Cleared — was mending the net when the bell rang"). Teams can also add their own freeform notes per suspect.

### 5.6 The Accusation (final node)
- Only the uncleared suspects are selectable.
- Team must select **one name** and type **one sentence of reasoning** (this is what a human judge uses for tie-breaks — and it makes the finish feel earned).
- Locks the clock immediately on submit.
- Reveal screen: the full solution written as a final chapter, plus the team's stats — total time, verdict accuracy (x/8 correct), penalties, final rank.

### 5.7 Leaderboard (fogged)
Live, but deliberately vague to preserve tension: shows team name, **Act** (I/II/III), and time — never the exact node. Only after a team finishes do full stats appear.

### 5.8 Admin Dashboard (organiser-only)
Non-negotiable for running this live. Needs:
- Live table of all teams: current node, time at that node, penalties, stuck-flag (>15 min at one node).
- **Manual unstick**: force-advance a team, grant a hint, or void a penalty (all actions logged).
- Global **pause / resume** (rain, crowd, an event overrunning) — pauses every team's clock at once.
- **QR generation & print sheet**: renders all node QRs + decoy QRs as a printable A4 sheet with node name, location description, and a volunteer instruction line.
- Broadcast message to all teams ("Return to the main stage in 10 minutes").
- CSV export of results.

---

## 6. SEQUENCE ENFORCEMENT (must be airtight)

Teams must not be able to skip, guess, or share their way forward.

1. **QR payload = signed token, not a URL with a node ID.** Each QR encodes `{node_id, nonce}` signed with HMAC-SHA256 using a server-side secret. IDs are opaque random strings (`n_8fj29x`), never sequential.
2. **Server-side validation only.** On scan, the server checks the signature, then checks `node.sequence_index == team.current_index`. Any mismatch returns a themed rejection ("This tent is not yet yours") and is **logged** as an out-of-order attempt.
3. **Never ship future content to the client.** Locked node names, testimonies, riddles and answers must not exist in any client bundle, API response, or Next.js prop payload. Fetch testimony content only after a successful scan+validate.
4. **Rate limiting** on the scan endpoint: max ~10 attempts/minute per team.
5. **Row-Level Security** on every table so a team can only ever read its own rows.
6. **Idempotent scans**: re-scanning the current node returns the same state, never double-advances or double-penalises.
7. **Optional geofence**: store lat/lng per node; if the browser grants location, flag scans >75 m away for admin review (soft flag, never a hard block — GPS is unreliable indoors).
8. Verdicts and advances are written server-side; the client never sends "my index is now N".

---

## 7. DATA MODEL (Supabase / PostgreSQL)

```
teams
  id, team_code, name, members jsonb, contact,
  current_node_index, started_at, finished_at,
  penalty_seconds, paused_seconds, status

nodes
  id (opaque), sequence_index, suspect_name, location_name,
  location_description, testimony_text, is_truthful bool,
  broken_mark enum(NONE|THREE|CASEFILE|NAME),
  riddle_plain, riddle_mirrored, mirror_style,
  clears_suspect_id, lat, lng, is_decoy bool, decoy_for_node_id

suspects
  id, name, role, portrait_url, flavour_text, is_murderer bool

scans
  id, team_id, node_id, scanned_at, was_valid,
  rejection_reason, lat, lng

verdicts
  id, team_id, node_id, choice enum(TRUTH|LIE),
  was_correct bool, submitted_at

hints
  id, team_id, node_id, used_at, cost_seconds

admin_actions
  id, admin_id, team_id, action_type, payload jsonb, created_at

game_config
  id, is_paused, paused_at, event_name, start_time
```

---

## 8. STACK

- **Next.js 15** (App Router, Server Actions for all state mutations)
- **Supabase** — Postgres + Auth (anonymous sessions keyed to team code) + Realtime (leaderboard, admin dashboard, cross-device team sync)
- **Tailwind CSS** + **Framer Motion** for node-unlock and stamp animations
- **html5-qrcode** or **@zxing/browser** for scanning
- **PWA**: installable, service worker, offline shell. Campus wifi is unreliable — **queue scan and verdict submissions locally and retry on reconnect**, with a visible "reconnecting…" state. Never lose a team's progress to a dead zone.
- Server-side `qrcode` package for QR generation in admin.

---

## 9. VISUAL DIRECTION

Dusty Victorian circus poster meets detective case file. Do **not** produce a generic dark-mode dashboard.

- **Palette:** oxblood `#5C1A1B`, aged parchment `#E8DCC4`, tarnished gold `#C9A227`, ink black `#141210`, faded teal `#2E5C5C` as accent.
- **Type:** a high-contrast display serif for headings and suspect names (Playfair Display, Abril Fatface, or Rye for signage moments); a warm readable serif for testimony body (Crimson Pro / Lora); a condensed sans for UI chrome and timers.
- **Texture:** subtle paper grain overlay, vignette edges, ink-bleed on stamps. Keep it light enough to stay readable outdoors at night.
- **Motion:** marquee bulbs that flicker at slightly irregular intervals on the active node; a verdict "stamp" that lands with weight; locked tents that drift faintly in fog.
- **Sound (optional, muted by default):** a distant carousel waltz on the midway screen, a single bell toll on node unlock.
- **Outdoor legibility is a hard requirement:** minimum 16px body text, high contrast, large tap targets, and a brightness-friendly variant. Ornament must never beat readability.

---

## 10. EXTRA MECHANICS WORTH BUILDING

- **Carnival Tokens** — each team gets 2. Spend one at a node for a hint that narrows which Mark to examine. Cost: +3 minutes. Creates a real risk/reward decision.
- **Madame Vireya's Tent** — one optional side node placed off the main path. Costs 5 minutes to visit, but grants one suspect elimination for free. Teams that are ahead can gamble; teams that are behind will be tempted. Excellent tension generator.
- **The Fortune Card** — on finishing, generate a shareable image: team name, rank, time, the suspect they accused, and a one-line "fortune". Free social reach for Aahladh (`@aahladh__iiitt`).
- **Volunteer word** — a second factor at each node: the stationed volunteer speaks a word the team types in. Kills QR-photo-sharing between teams outright. Rotate words hourly from the admin panel.
- **Spectator screen** — a big-screen view for the main stage: fogged live leaderboard, teams' names lighting up as they resolve nodes. Turns the hunt into a watchable event.
- **Staggered starts** — release teams 3 minutes apart so 15 teams don't converge on one QR. Build this into admin as a start-queue.

---

## 11. BUILD ORDER

1. Schema + seed data (8 nodes, 7 suspects, 4 decoys, full testimony text).
2. Auth, team creation, team-code join.
3. Scan → server validate → unlock flow (get this bulletproof before anything visual).
4. Testimony view + verdict submission + mirror reveal.
5. The Midway roadmap with lock/unlock states.
6. Deduction board.
7. Accusation + reveal + scoring.
8. Admin dashboard + QR print sheet.
9. Leaderboard + spectator screen.
10. PWA, offline queue, polish, motion.

---

## 12. DELIVERABLES

- Working app, deployed (Vercel).
- Seed script with all 8 testimonies written to the tone above, each tagged with which Mark it breaks.
- Printable QR sheet: node QR, location name, volunteer instruction, volunteer word slot.
- A one-page **Case File** card design for teams (the Three Marks + the five fixed facts).
- A short organiser runbook: how to start the game, unstick a team, pause, and export results.

---

## RUN-DAY NOTES (not code — for the organisers)

- Laminate the QR codes. It will rain, or someone will spill something.
- Print two copies of each QR and place them a few metres apart at each location, so 15 teams don't queue at one poster.
- Station a volunteer at every node. They hold the volunteer word and can confirm a team actually arrived.
- Do a full dry run with one team the day before. Every timing assumption you have is wrong until tested.
- Target duration: 75–90 minutes for 8 nodes across a campus. If your dry-run team takes 2 hours, cut a node.
