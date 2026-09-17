# Railway deployment guide — The Carnival of Lies

This guide deploys the hunt as a **single production service** on
[Railway](https://railway.app) with a **persistent SQLite** database.

Participants use the public site only. Organisers use `/admin` with a strong
password. Dev helper routes (`/dev/*`) return **404** in production.

---

## 1. What you are deploying

| Piece | Detail |
|-------|--------|
| Runtime | Next.js standalone (`Dockerfile`) |
| Database | SQLite file on a Railway **volume** at `/data/carnival.db` |
| Scale | **Exactly 1 replica** (SQLite + in-memory rate limits) |
| HTTPS | Railway edge proxy (app listens HTTP on `PORT`) |
| Boot | `prisma migrate deploy` → seed **if empty** → `node server.js` |

Do **not** use Vercel/serverless for this app. Do **not** scale above one
instance.

---

## 2. Prerequisites

1. A [Railway](https://railway.app) account.
2. This repo pushed to GitHub (or GitLab) and linked to Railway.
3. Strong secrets ready (generate with a password manager), for example:
   - `QR_HMAC_SECRET` — at least **16** random characters (locks QR signatures).
   - `ADMIN_PASSWORD` — at least **8** characters (organiser console).
   - `ADMIN_SESSION_SECRET` — long random string (admin cookie pepper).
4. Docker is optional locally; Railway builds from the repo `Dockerfile`.

---

## 3. Create the Railway project

1. Open Railway → **New Project** → **Deploy from GitHub repo**.
2. Select this repository and the branch you want (`main`).
3. Railway should detect [`Dockerfile`](./Dockerfile) (also declared in
   [`railway.toml`](./railway.toml)).
4. Do **not** switch to Nixpacks — the Dockerfile is required for
   `better-sqlite3`, Prisma migrate, and seed-on-boot.

If the service was created with Nixpacks by mistake: **Settings → Build** →
set builder to **Dockerfile** and path `Dockerfile`.

---

## 4. Attach a persistent volume (required)

Without a volume, the database is wiped on every redeploy.

1. Open the service → **Volumes** (or **Settings → Volumes**).
2. **Add volume**.
3. Mount path: `/data`
4. Save / redeploy after attaching.

The app default is:

```text
DATABASE_URL=file:/data/carnival.db
```

The file `carnival.db` is created on first migrate/seed inside `/data`.

---

## 5. Set environment variables

Open the service → **Variables** and set:

| Variable | Required | Value / notes |
|----------|----------|----------------|
| `DATABASE_URL` | Yes | `file:/data/carnival.db` |
| `QR_HMAC_SECRET` | Yes | ≥16 chars. App **throws** if missing in production. |
| `ADMIN_PASSWORD` | Yes | ≥8 chars. Without it, admin login is disabled. |
| `ADMIN_SESSION_SECRET` | Strongly recommended | Random pepper for admin sessions. |
| `NODE_ENV` | Yes | `production` (Dockerfile also sets this). |
| `FORCE_SEED` | No | Leave **unset**. Only `1` for emergency wipe+reseed. |

Railway injects `PORT` automatically — do not hardcode a conflicting public port
in a way that ignores it. The container listens on `0.0.0.0:$PORT`.

**Never** put secrets in the git repo. Keep `.env` local-only.

---

## 6. Deploy settings

1. **Replicas / instances: 1** only.
2. Enable a public domain: **Settings → Networking → Generate domain**
   (or attach a custom domain). Railway terminates HTTPS for you.
3. Health check: [`railway.toml`](./railway.toml) uses path `/`.
4. Restart policy: on failure (configured in `railway.toml`).

Deploy (push to the connected branch, or **Deploy** from the Railway UI).

---

## 7. First boot — what happens

On each container start:

1. `prisma migrate deploy` applies schema migrations to `/data/carnival.db`.
2. `prisma/seed.ts` runs:
   - If suspects already exist → **skips** (safe for redeploys).
   - If the DB is empty → seeds suspects, story tents, decoys, game config.
3. Next.js standalone starts (`node server.js`).

### Verify

1. Open `https://<your-railway-domain>/` — registration / landing loads.
2. Open `https://<your-railway-domain>/dev/qr` — must be **404**.
3. Open `https://<your-railway-domain>/admin/login` — login form appears.
4. Sign in with `ADMIN_PASSWORD` → organiser dashboard.

If `/` crashes with a QR secret error, set `QR_HMAC_SECRET` (≥16) and redeploy.

---

## 8. Organiser (admin) after go-live

1. Sign in at `/admin/login` (do not share the password with participants).
2. Print tent QR codes at `/admin/print` (after seed).
3. Export CSV at `/admin/export` when needed.
4. Use pause / broadcast / force-advance / hints from the admin UI only.

### Participants must not get

- Admin password or `/admin` links (there are none on the player UI).
- Access to `/dev/*` (404 in production).
- The ability to change `FORCE_SEED` or Railway variables.

Give participants only:

- The public site URL.
- Their team code after registration / join.

---

## 9. Redeploys, backups, and resets

### Normal redeploy (code change)

Safe. Migrate runs; seed **skips** if data exists. Teams and QR tokens stay
stable as long as `QR_HMAC_SECRET` does not change and the volume is intact.

### Backup

Before major changes, download/copy the SQLite file from the volume
(`/data/carnival.db`) via Railway’s volume/backup tools or a one-off shell.

### Emergency full reset

1. Pause the public event if needed.
2. Set `FORCE_SEED=1` temporarily.
3. Redeploy once (wipes teams, regenerates node QR tokens).
4. **Remove** `FORCE_SEED` immediately.
5. Re-print all QR stickers from `/admin/print`.

**Shorter QR payloads** (8-char token + 16-char MAC): any deploy that ships
this change **must** re-seed and re-print — old printed codes will fail verify.
Do not roll out mid-hunt without re-registering teams.

Changing `QR_HMAC_SECRET` also invalidates all printed QR payloads — treat it
like a wipe of physical stickers.

---

## 10. Troubleshooting

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| App boots but data vanishes after deploy | No volume / wrong mount | Mount volume at `/data`; set `DATABASE_URL=file:/data/carnival.db` |
| Crash: `QR_HMAC_SECRET must be set` | Missing/short secret | Set ≥16 char secret; redeploy |
| Crash: `Cannot find module 'effect'` (or `fast-check` / Prisma config load) | Incomplete Docker `node_modules` (cherry-picked Prisma CLI) | Use current `Dockerfile` which overlays the full `deps` `node_modules`; redeploy a fresh build |
| `/admin/login` says password not configured | Missing/short `ADMIN_PASSWORD` | Set ≥8 chars |
| Empty hunt (no tents) | Seed never ran / migrate failed | Check deploy logs; ensure volume writable; restart once |
| Rate limits weird / DB locks | More than one replica | Scale to **1** |
| Camera works on HTTPS domain | Expected | Railway HTTPS is a secure context; use the Railway URL on phones |
| `/dev/qr` still visible | Not production build | Confirm `NODE_ENV=production` and Dockerfile deploy |
| Seed wiped live teams | `FORCE_SEED=1` left on | Unset it; restore volume backup if you have one |

### Useful log lines

- `Database already seeded (N suspects). Skipping seed.` — good on redeploy.
- `Seeded 7 suspects, 8 story nodes, 9 decoys.` — first boot seed OK.
- Prisma migrate errors — volume permissions or `DATABASE_URL` path wrong.

---

## 11. Local production-parity (optional)

```bash
docker build -t carnival-of-lies .
docker run --rm -p 3000:3000 \
  -v carnival-data:/data \
  -e DATABASE_URL="file:/data/carnival.db" \
  -e QR_HMAC_SECRET="your-long-random-secret" \
  -e ADMIN_PASSWORD="your-strong-admin-password" \
  -e ADMIN_SESSION_SECRET="your-session-pepper" \
  -e NODE_ENV=production \
  carnival-of-lies
```

Open `http://localhost:3000` (camera on phones still wants HTTPS — use the
Railway URL for real participant tests).

---

## 12. Checklist (copy/paste)

- [ ] Repo connected; builder = **Dockerfile**
- [ ] Volume mounted at `/data`
- [ ] `DATABASE_URL=file:/data/carnival.db`
- [ ] `QR_HMAC_SECRET` (≥16)
- [ ] `ADMIN_PASSWORD` (≥8)
- [ ] `ADMIN_SESSION_SECRET` set
- [ ] `NODE_ENV=production`
- [ ] `FORCE_SEED` unset
- [ ] Replicas = **1**
- [ ] Public HTTPS domain generated
- [ ] `/` loads; `/dev/qr` is 404; `/admin/login` works
- [ ] Printed QR sheet from `/admin/print` after first seed
- [ ] Participants only have public URL + team codes

For app overview and local development, see [`README.md`](./README.md).
