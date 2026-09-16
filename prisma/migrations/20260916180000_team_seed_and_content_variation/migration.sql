-- AlterTable Team: add teamSeed
-- AlterTable Node: strip narrative columns; replace decoyForIndexes with decoyPool

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "members" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "teamSeed" TEXT NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "penaltySeconds" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);
INSERT INTO "new_Team" ("id", "teamCode", "name", "members", "contact", "teamSeed", "currentIndex", "penaltySeconds", "status", "startedAt", "finishedAt")
SELECT "id", "teamCode", "name", "members", "contact", lower(hex(randomblob(16))), "currentIndex", "penaltySeconds", "status", "startedAt", "finishedAt" FROM "Team";
DROP TABLE "Team";
ALTER TABLE "new_Team" RENAME TO "Team";
CREATE UNIQUE INDEX "Team_teamCode_key" ON "Team"("teamCode");

CREATE TABLE "new_Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sequenceIndex" INTEGER NOT NULL,
    "suspectId" TEXT,
    "locationName" TEXT NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "act" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "isDecoy" BOOLEAN NOT NULL DEFAULT false,
    "decoyPool" TEXT,
    "decoyPassage" TEXT,
    CONSTRAINT "Node_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Node" ("id", "sequenceIndex", "suspectId", "locationName", "locationDescription", "act", "token", "isDecoy", "decoyPool", "decoyPassage")
SELECT "id", "sequenceIndex", "suspectId", "locationName", "locationDescription", "act", "token", "isDecoy",
  CASE
    WHEN "decoyForIndexes" IN ('0,1') THEN 'act1'
    WHEN "decoyForIndexes" IN ('2,3') THEN 'act1'
    WHEN "decoyForIndexes" IN ('4,5') THEN 'act2'
    WHEN "decoyForIndexes" IN ('6,7') THEN 'act3'
    ELSE NULL
  END,
  "decoyPassage"
FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
CREATE UNIQUE INDEX "Node_sequenceIndex_key" ON "Node"("sequenceIndex");
CREATE UNIQUE INDEX "Node_token_key" ON "Node"("token");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
