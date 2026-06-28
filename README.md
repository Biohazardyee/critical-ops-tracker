# critical-ops-tracker

A **Critical Ops** player tracker — web UI (à la tracker.gg) **and** a Discord bot,
built on the public Critical Force API.

> ⚠️ The data source (`default.prod.copsapi.criticalforce.fi`) is a public, **unofficial**
> Critical Force endpoint with no documentation or guarantees. It can change or break.
> The numeric rank → tier mapping in [`packages/core/src/ranks.ts`](packages/core/src/ranks.ts)
> is a best-effort guess and should be verified against the game.

## What the API gives us

Per player: level/XP, current rank & MMR, highest rank, leaderboard position, clan,
and **per-season** kills/deaths/assists/wins/losses for `ranked`, `casual` and `custom`.

There is **no per-match history**. To build a history we **snapshot** tracked players
periodically (the `worker`) and compute deltas over time.

## Structure (npm workspaces)

```
packages/
  core/   @cops/core — typed API client + stat math (no deps, shared everywhere)
  db/     @cops/db   — Prisma schema + client + snapshot helpers (SQLite)
apps/
  api/    @cops/api    — Fastify REST API
  web/    @cops/web    — Vite + React + Tailwind UI
  worker/ @cops/worker — node-cron snapshotter
  bot/    @cops/bot    — discord.js /track command
```

`core` and `db` are consumed as TypeScript source (no build step) — `tsx` and Vite
transpile them on the fly.

## Setup

```bash
npm install

# env
cp .env.example .env                 # repo root (used by api/worker/bot at runtime)
cp packages/db/.env.example packages/db/.env   # used by the Prisma CLI

# database (SQLite)
npm run db:generate                  # generate Prisma client
npm run db:migrate                   # create the dev.db and tables
```

## Run

```bash
npm run dev:api      # API on http://localhost:8787
npm run dev:web      # Web on http://localhost:5173 (proxies /api -> 8787)

npm run worker       # start the cron snapshotter (SNAPSHOT_CRON)
npm run once -w @cops/worker         # take a single snapshot pass now

# Discord bot (needs DISCORD_* in .env)
npm run bot:deploy   # register the /track slash command
npm run dev:bot      # start the bot
```

## API endpoints

| Method | Path                          | Description                          |
| ------ | ----------------------------- | ------------------------------------ |
| GET    | `/api/health`                 | health check                         |
| GET    | `/api/servers`                | game server statuses                 |
| GET    | `/api/player/:name`           | live profile summary + `tracked`     |
| GET    | `/api/player/:name/history`   | stored snapshots for the player      |
| POST   | `/api/player/:name/track`     | start tracking + take a snapshot     |

## Useful scripts

```bash
npm run typecheck    # type-check every workspace
npm run build        # build workspaces that define a build script (web)
npm run db:studio    # open Prisma Studio
```

## Notes

- Requires **Node >= 20** (uses the global `fetch`).
- To switch from SQLite to Postgres, change `provider` in
  [`packages/db/prisma/schema.prisma`](packages/db/prisma/schema.prisma) and update `DATABASE_URL`.
