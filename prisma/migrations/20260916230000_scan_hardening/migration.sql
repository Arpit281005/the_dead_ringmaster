-- Harden scan pipeline: nodeSlot, minExpectedSeconds, TeamDevice, SecurityFlag
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sequenceIndex" INTEGER NOT NULL,
    "nodeSlot" TEXT NOT NULL,
    "suspectId" TEXT,
    "locationName" TEXT NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "act" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "minExpectedSeconds" INTEGER NOT NULL DEFAULT 0,
    "isDecoy" BOOLEAN NOT NULL DEFAULT false,
    "decoyPool" TEXT,
    "decoyPassage" TEXT,
    CONSTRAINT "Node_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Node" ("id", "sequenceIndex", "nodeSlot", "suspectId", "locationName", "locationDescription", "act", "token", "minExpectedSeconds", "isDecoy", "decoyPool", "decoyPassage")
SELECT
  "id",
  "sequenceIndex",
  CASE WHEN "isDecoy" = 1 THEN 'D' || "id" ELSE 'S' || "sequenceIndex" END,
  "suspectId",
  "locationName",
  "locationDescription",
  "act",
  "token",
  CASE
    WHEN "isDecoy" = 1 THEN 0
    WHEN "act" = 1 THEN 90
    WHEN "act" = 2 THEN 180
    WHEN "act" = 3 THEN 240
    ELSE 0
  END,
  "isDecoy",
  "decoyPool",
  "decoyPassage"
FROM "Node";
DROP TABLE "Node";
ALTER TABLE "new_Node" RENAME TO "Node";
CREATE UNIQUE INDEX "Node_sequenceIndex_key" ON "Node"("sequenceIndex");
CREATE UNIQUE INDEX "Node_nodeSlot_key" ON "Node"("nodeSlot");
CREATE UNIQUE INDEX "Node_token_key" ON "Node"("token");

CREATE TABLE "TeamDevice" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "firstIp" TEXT,
    "lastIp" TEXT,
    "userAgent" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamDevice_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "TeamDevice_teamId_deviceId_key" ON "TeamDevice"("teamId", "deviceId");

CREATE TABLE "SecurityFlag" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "nodeId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledgedAt" DATETIME,
    CONSTRAINT "SecurityFlag_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "SecurityFlag_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
