-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_TeamFact" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "factKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "cipherKey" TEXT,
    "sourceSequenceIndex" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamFact_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_TeamFact" ("id", "teamId", "factKey", "text", "sourceSequenceIndex", "createdAt")
SELECT "id", "teamId", "factKey", "text", "sourceSequenceIndex", "createdAt" FROM "TeamFact";
DROP TABLE "TeamFact";
ALTER TABLE "new_TeamFact" RENAME TO "TeamFact";
CREATE UNIQUE INDEX "TeamFact_teamId_factKey_key" ON "TeamFact"("teamId", "factKey");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
