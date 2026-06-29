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

## Deploy with Docker

One shared Node image (api / worker / bot) + an nginx image (web) + Postgres.

```bash
cp .env.example .env        # set POSTGRES_PASSWORD (and DISCORD_* if using the bot)

docker compose up -d --build         # db + migrate + api + worker + web
docker compose --profile bot up -d   # also start the Discord bot (optional)
```

- Web UI → `http://<host>:8080` (nginx serves the UI and proxies `/api` to the api service).
- `migrate` is a one-shot service that runs `prisma db push` before api/worker start.
- Postgres data persists in the `pgdata` volume.
- Put your own reverse proxy / TLS (Caddy, Traefik, nginx) in front of port 8080.

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

## Useful scripts

```bash
npm run typecheck    # type-check every workspace
npm run build        # build workspaces that define a build script (web)
npm run db:studio    # open Prisma Studio
```

## Notes

- Requires **Node >= 20** (uses the global `fetch`).
- `core` is browser-safe (no Node-only APIs); the web app imports types from it.
