-- CreateTable
CREATE TABLE "Suspect" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "flavourText" TEXT NOT NULL,
    "isMurderer" BOOLEAN NOT NULL DEFAULT false,
    "order" INTEGER NOT NULL DEFAULT 0
);

-- CreateTable
CREATE TABLE "Node" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sequenceIndex" INTEGER NOT NULL,
    "suspectId" TEXT,
    "locationName" TEXT NOT NULL,
    "locationDescription" TEXT NOT NULL,
    "act" INTEGER NOT NULL,
    "testimonyText" TEXT NOT NULL,
    "isTruthful" BOOLEAN NOT NULL,
    "brokenMark" TEXT NOT NULL,
    "riddlePlain" TEXT NOT NULL,
    "riddleMirrored" TEXT NOT NULL,
    "mirrorStyle" TEXT NOT NULL,
    "clearReason" TEXT,
    "token" TEXT NOT NULL,
    "isDecoy" BOOLEAN NOT NULL DEFAULT false,
    "decoyForIndexes" TEXT,
    "decoyPassage" TEXT,
    CONSTRAINT "Node_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Team" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "members" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "currentIndex" INTEGER NOT NULL DEFAULT 0,
    "penaltySeconds" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" DATETIME
);

-- CreateTable
CREATE TABLE "Scan" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "scannedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "wasValid" BOOLEAN NOT NULL,
    "rejectionReason" TEXT,
    CONSTRAINT "Scan_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Scan_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Verdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verdict_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Verdict_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Clearance" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "suspectId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "clearedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Clearance_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Clearance_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Clearance_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TeamNote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "suspectId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TeamNote_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TeamNote_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Accusation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "suspectId" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Accusation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Accusation_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Node_sequenceIndex_key" ON "Node"("sequenceIndex");

-- CreateIndex
CREATE UNIQUE INDEX "Node_token_key" ON "Node"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Team_teamCode_key" ON "Team"("teamCode");

-- CreateIndex
CREATE UNIQUE INDEX "TeamNote_teamId_suspectId_key" ON "TeamNote"("teamId", "suspectId");

-- CreateIndex
CREATE UNIQUE INDEX "Accusation_teamId_key" ON "Accusation"("teamId");
