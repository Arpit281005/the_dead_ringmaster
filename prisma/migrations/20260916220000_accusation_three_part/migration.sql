-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Accusation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "suspectId" TEXT NOT NULL,
    "methodSubmitted" TEXT NOT NULL,
    "factKeywordSubmitted" TEXT NOT NULL,
    "reasoning" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "suspectCorrect" BOOLEAN NOT NULL,
    "methodCorrect" BOOLEAN NOT NULL,
    "factCorrect" BOOLEAN NOT NULL,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Accusation_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Accusation_suspectId_fkey" FOREIGN KEY ("suspectId") REFERENCES "Suspect" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Accusation" ("id", "teamId", "suspectId", "methodSubmitted", "factKeywordSubmitted", "reasoning", "wasCorrect", "suspectCorrect", "methodCorrect", "factCorrect", "submittedAt")
SELECT "id", "teamId", "suspectId", '', '', "reasoning", "wasCorrect", "wasCorrect", false, false, "submittedAt" FROM "Accusation";
DROP TABLE "Accusation";
ALTER TABLE "new_Accusation" RENAME TO "Accusation";
CREATE UNIQUE INDEX "Accusation_teamId_key" ON "Accusation"("teamId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
