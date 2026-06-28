-- CreateTable
CREATE TABLE "TrackedPlayer" (
    "userId" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "addedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "Snapshot" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "takenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" INTEGER NOT NULL,
    "mmr" INTEGER NOT NULL,
    "rank" INTEGER NOT NULL,
    "rankedKills" INTEGER NOT NULL,
    "rankedDeaths" INTEGER NOT NULL,
    "rankedAssists" INTEGER NOT NULL,
    "rankedWins" INTEGER NOT NULL,
    "rankedLosses" INTEGER NOT NULL,
    "raw" TEXT NOT NULL,
    CONSTRAINT "Snapshot_userId_fkey" FOREIGN KEY ("userId") REFERENCES "TrackedPlayer" ("userId") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Snapshot_userId_takenAt_idx" ON "Snapshot"("userId", "takenAt");
