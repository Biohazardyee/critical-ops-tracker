import type { FastifyPluginAsync } from "fastify";
import { CopsClient, LEADERBOARD_MODES, type LeaderboardMode } from "@cops/core";

const cops = new CopsClient();
const MODES = new Set<string>(LEADERBOARD_MODES);

export const leaderboardRoutes: FastifyPluginAsync = async (app) => {
  app.get<{ Params: { mode: string }; Querystring: { limit?: string } }>(
    "/leaderboard/:mode",
    async (req, reply) => {
      const { mode } = req.params;
      if (!MODES.has(mode)) {
        return reply.code(400).send({
          error: `Unknown leaderboard mode "${mode}". Valid: ${[...MODES].join(", ")}`,
        });
      }
      const entries = await cops.getLeaderboard(mode as LeaderboardMode);
      const limit = Number(req.query.limit ?? 100);
      const sliced =
        Number.isFinite(limit) && limit > 0 ? entries.slice(0, limit) : entries;
      return { mode, count: entries.length, entries: sliced };
    },
  );
};
