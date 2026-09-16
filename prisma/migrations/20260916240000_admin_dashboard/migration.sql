-- AlterTable
ALTER TABLE "Team" ADD COLUMN "pausedSeconds" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Team" ADD COLUMN "organiserHint" TEXT;

-- CreateTable
CREATE TABLE "GameConfig" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'singleton',
    "eventName" TEXT NOT NULL DEFAULT 'The Carnival of Lies',
    "isPaused" BOOLEAN NOT NULL DEFAULT false,
    "pausedAt" DATETIME,
    "broadcastMessage" TEXT,
    "broadcastAt" DATETIME
);

INSERT INTO "GameConfig" ("id", "eventName", "isPaused") VALUES ('singleton', 'The Carnival of Lies', false);

CREATE TABLE "AdminAction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "adminLabel" TEXT NOT NULL DEFAULT 'organiser',
    "teamId" TEXT,
    "actionType" TEXT NOT NULL,
    "payload" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "AdminAction_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
