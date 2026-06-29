import "./env.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { CopsApiError } from "@cops/core";
import { serverRoutes } from "./routes/servers.js";
import { playerRoutes } from "./routes/player.js";
import { leaderboardRoutes } from "./routes/leaderboard.js";
import { eventsRoutes } from "./routes/events.js";

const app = Fastify({ logger: true });

await app.register(cors, { origin: true });

app.get("/api/health", async () => ({ ok: true, service: "cops-api" }));
await app.register(serverRoutes, { prefix: "/api" });
await app.register(playerRoutes, { prefix: "/api" });
await app.register(leaderboardRoutes, { prefix: "/api" });
await app.register(eventsRoutes, { prefix: "/api" });

app.setErrorHandler((err, _req, reply) => {
  if (err instanceof CopsApiError) {
    return reply.code(err.status ?? 502).send({ error: err.message });
  }
  app.log.error(err);
  return reply.code(500).send({ error: "Internal server error" });
});

const port = Number(process.env.API_PORT ?? 8787);

try {
  await app.listen({ port, host: "0.0.0.0" });
} catch (err) {
  app.log.error(err);
  process.exit(1);
}
