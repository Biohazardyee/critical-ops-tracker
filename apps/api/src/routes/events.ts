import type { FastifyPluginAsync } from "fastify";
import { CopsClient } from "@cops/core";
import { followPlayer, unfollowPlayer, getFeed } from "@cops/db";
import { cached } from "../cache.js";

const cops = new CopsClient();

const resolve = (name: string) =>
  cached(`profile:${name.toLowerCase()}`, () => cops.getProfileByName(name));

interface FollowBody {
  token?: string;
  name?: string;
}

export const eventsRoutes: FastifyPluginAsync = async (app) => {
  // Notification feed for the players a device token follows.
  app.get<{ Querystring: { token?: string; limit?: string } }>(
    "/feed",
    async (req) => {
      const token = (req.query.token ?? "").trim();
      if (!token) return { events: [] };
      const limit = Math.min(Number(req.query.limit ?? 30) || 30, 100);
      const events = await getFeed(token, limit);
      return { events };
    },
  );

  app.post<{ Body: FollowBody }>("/feed/follow", async (req, reply) => {
    const { token, name } = req.body ?? {};
    if (!token || !name) {
      return reply.code(400).send({ error: "token and name are required" });
    }
    await followPlayer(token, await resolve(name));
    return { ok: true };
  });

  app.post<{ Body: FollowBody }>("/feed/unfollow", async (req, reply) => {
    const { token, name } = req.body ?? {};
    if (!token || !name) {
      return reply.code(400).send({ error: "token and name are required" });
    }
    const profile = await resolve(name);
    await unfollowPlayer(token, String(profile.basicInfo.userID));
    return { ok: true };
  });
};
