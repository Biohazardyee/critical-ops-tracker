import type { FastifyPluginAsync } from "fastify";
import { CopsClient } from "@cops/core";

const cops = new CopsClient();

export const serverRoutes: FastifyPluginAsync = async (app) => {
  app.get("/servers", async () => {
    const status = await cops.getServerStatus();
    return Object.entries(status).map(([id, s]) => ({ id, ...s }));
  });
};
