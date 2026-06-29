# critical-ops-tracker

A **Critical Ops** player tracker — web UI (à la tracker.gg) **and** a Discord bot,
built on the public Critical Force API.

> ⚠️ The data source (`default.prod.copsapi.criticalforce.fi`) is a public, **unofficial**
> Critical Force endpoint with no documentation or guarantees. It can change or break.

## What the API gives us

Per player: level/XP, current rank & MMR, highest rank, leaderboard position, clan,
and **per-season** kills/deaths/assists/wins/losses for `ranked`, `casual` and `custom`.
Leaderboards (`elite`, `ranked`, `kills`, `clan`) are capped at the top 1000 by the source.

There is **no per-match history**. To build a history we **snapshot** tracked players
periodically (the `worker`) and compute deltas over time.

The rank → tier mapping in [`packages/core/src/ranks.ts`](packages/core/src/ranks.ts)
was verified against live data (`0 Unranked … 8 Special Ops, 9 Elite Ops`).

## Structure (npm workspaces)

```
packages/
  core/   @cops/core — typed API client + stat math (no deps, shared everywhere)
  db/     @cops/db   — Prisma schema + client + snapshot helpers (PostgreSQL)
apps/
  api/    @cops/api    — Fastify REST API
  web/    @cops/web    — Vite + React + Tailwind UI
  worker/ @cops/worker — node-cron snapshotter
  bot/    @cops/bot    — discord.js /track command
```

`core` and `db` are consumed as TypeScript source (no build step) — `tsx` and Vite
transpile them on the fly.

## Local setup

```bash
npm install

cp .env.example .env                            # api/worker/bot runtime
cp packages/db/.env.example packages/db/.env    # Prisma CLI

# Postgres (via Docker) + schema
docker compose up -d db
npm run db:generate                             # generate Prisma client
npm run db:push                                 # create/sync tables
```

## Run (dev)

```bash
npm run dev:api      # API on http://localhost:8787
npm run dev:web      # Web on http://localhost:5173 (proxies /api -> 8787)

npm run worker                       # cron snapshotter (SNAPSHOT_CRON)
npm run once -w @cops/worker         # take a single snapshot pass now

# Discord bot (needs DISCORD_* in .env)
npm run bot:deploy   # register the /track slash command
npm run dev:bot      # start the bot
```

## Run it with Docker

Images: one shared Node image (`api` / `worker` / `bot` / one-shot `migrate`) +
an nginx image (`web`) + Postgres. Set up the env once:

```bash
cp .env.example .env   # POSTGRES_PASSWORD, WEB_PORT, CLOUDFLARE_TUNNEL_TOKEN, DISCORD_* as needed
```

### Everyday commands

```bash
# Start everything (builds images on first run)
docker compose up -d --build

# Rebuild + restart after a CODE change
docker compose up -d --build            # or target one: ... --build api

# Restart one service (no rebuild)
docker compose restart api              # or worker / web

# Apply a SCHEMA change (after editing prisma/schema.prisma)
docker compose run --rm migrate         # runs `prisma db push`

# Logs / status
docker compose logs -f api worker
docker compose ps

# Stop (keep data)   |   Stop + wipe the database
docker compose down  |   docker compose down -v
```

### Optional services (profiles)

```bash
docker compose --profile bot up -d            # Discord bot (needs DISCORD_*)
docker compose run --rm bot npm run deploy -w @cops/bot   # register /track once
docker compose --profile cloudflared up -d    # Cloudflare Tunnel (needs CLOUDFLARE_TUNNEL_TOKEN)
```

To make a profile part of the default `docker compose up`, set it in `.env`:

```bash
COMPOSE_PROFILES=cloudflared      # (or "cloudflared,bot") — now plain `up -d` includes it
```

### Updating a running server

```bash
git pull
docker compose up -d --build              # rebuild changed images & restart
docker compose run --rm migrate           # only if the Prisma schema changed
```

### Access

- Direct: `http://<host>:${WEB_PORT:-8080}` — nginx serves the SPA and proxies `/api`.
- Via **Cloudflare Tunnel** (recommended): add a Public Hostname route → `http://web:80`
  (no host port to open). See `CLOUDFLARE_TUNNEL_TOKEN` in `.env`.
- `migrate` is a one-shot service (`prisma db push`) that api/worker wait on; Postgres
  data persists in the `pgdata` volume.

### Backups

The `db-backup` service dumps Postgres daily into `./backups` (retention: 7 days /
4 weeks / 6 months). Restore the latest dump:

```bash
ls -t backups/daily                                   # find the dump you want
gunzip -c backups/daily/<file>.sql.gz | \
  docker compose exec -T db psql -U cops -d cops       # restore into the DB
```

## API endpoints

| Method | Path                         | Description                        |
| ------ | ---------------------------- | ---------------------------------- |
| GET    | `/api/health`                | health check                       |
| GET    | `/api/servers`               | game server statuses               |
| GET    | `/api/player/:name`          | live profile summary + `tracked`   |
| GET    | `/api/player/:name/history`  | stored snapshots for the player    |
| POST   | `/api/player/:name/track`    | start tracking + take a snapshot   |
| GET    | `/api/players?names=a,b`     | batch summaries (watchlist)        |
| GET    | `/api/leaderboard/:mode`     | `elite` / `ranked` / `kills` / `clan` (supports `?limit=`) |
| GET    | `/api/feed?token=…`          | notification events for a device token |
| POST   | `/api/feed/follow`           | `{ token, name }` — follow a player |
| POST   | `/api/feed/unfollow`         | `{ token, name }` — unfollow         |

## Useful scripts

```bash
npm run typecheck    # type-check every workspace
npm run build        # build workspaces that define a build script (web)
npm run db:studio    # open Prisma Studio
```

## Notes

- Requires **Node >= 20** (uses the global `fetch`).
- `core` is browser-safe (no Node-only APIs); the web app imports types from it.
