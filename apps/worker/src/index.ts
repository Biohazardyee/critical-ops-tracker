import "./env.js";
import cron from "node-cron";
import { CopsClient } from "@cops/core";
import { listTrackedPlayers, recordSnapshot } from "@cops/db";

const cops = new CopsClient();

async function snapshotAll(): Promise<void> {
  const players = await listTrackedPlayers();
  if (players.length === 0) {
    console.log("[worker] No tracked players yet — nothing to snapshot.");
    return;
  }
  console.log(`[worker] Snapshotting ${players.length} player(s)...`);
  for (const p of players) {
    try {
      const profile = await cops.getProfileById(p.userId);
      await recordSnapshot(profile);
      console.log(`[worker]   ok  ${profile.basicInfo.name} (${p.userId})`);
    } catch (err) {
      console.error(
        `[worker]   err ${p.name} (${p.userId}): ${(err as Error).message}`,
      );
    }
  }
  console.log("[worker] Done.");
}

// `--once` runs a single pass and exits (handy for cron systems / CI).
if (process.argv.includes("--once")) {
  await snapshotAll();
  process.exit(0);
}

const schedule = process.env.SNAPSHOT_CRON ?? "0 4 * * *";
if (!cron.validate(schedule)) {
  console.error(`[worker] Invalid SNAPSHOT_CRON expression: "${schedule}"`);
  process.exit(1);
}

console.log(`[worker] Scheduled with cron "${schedule}". Waiting for ticks...`);
cron.schedule(schedule, () => {
  void snapshotAll();
});
