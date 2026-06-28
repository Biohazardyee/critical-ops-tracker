import type { FastifyPluginAsync } from "fastify";
import { CopsClient, summarizeProfile } from "@cops/core";
import { prisma, recordSnapshot, getSnapshots } from "@cops/db";

const cops = new CopsClient();

interface NameParams {
  name: string;
}

export const playerRoutes: FastifyPluginAsync = async (app) => {
  // Batch lookup (one upstream call) — used by the watchlist dashboard.
  app.get<{ Querystring: { names?: string } }>("/players", async (req) => {
    const names = (req.query.names ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (names.length === 0) return { players: [] };
    const profiles = await cops.getProfilesByName(names);
    return { players: profiles.map(summarizeProfile) };
  });

  // Live profile + whether we already track this player.
  app.get<{ Params: NameParams }>("/player/:name", async (req) => {
    const profile = await cops.getProfileByName(req.params.name);
    const summary = summarizeProfile(profile);
    const tracked = await prisma.trackedPlayer.findUnique({
      where: { userId: String(summary.userId) },
    });
    return { summary, tracked: tracked != null };
  });

  // Locally stored snapshot history for this player.
  app.get<{ Params: NameParams }>("/player/:name/history", async (req) => {
    const profile = await cops.getProfileByName(req.params.name);
    const userId = String(profile.basicInfo.userID);
    const snapshots = await getSnapshots(userId);
    return {
      userId,
      name: profile.basicInfo.name,
      tracked: snapshots.length > 0,
      snapshots,
    };
  });

  // Start tracking a player and capture an initial snapshot.
  app.post<{ Params: NameParams }>("/player/:name/track", async (req) => {
    const profile = await cops.getProfileByName(req.params.name);
    const snapshot = await recordSnapshot(profile);
    return { tracked: true, snapshot, summary: summarizeProfile(profile) };
  });
};
