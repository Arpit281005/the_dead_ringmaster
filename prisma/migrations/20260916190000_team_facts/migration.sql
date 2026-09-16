-- CreateTable
CREATE TABLE "TeamFact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "factKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "sourceSequenceIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamFact_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "TeamFact_teamId_factKey_key" ON "TeamFact"("teamId", "factKey");
