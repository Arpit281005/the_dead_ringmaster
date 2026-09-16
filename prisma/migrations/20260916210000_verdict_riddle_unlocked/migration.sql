-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Verdict" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "teamId" TEXT NOT NULL,
    "nodeId" TEXT NOT NULL,
    "choice" TEXT NOT NULL,
    "wasCorrect" BOOLEAN NOT NULL,
    "riddleUnlocked" BOOLEAN NOT NULL DEFAULT false,
    "submittedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Verdict_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Verdict_nodeId_fkey" FOREIGN KEY ("nodeId") REFERENCES "Node" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Verdict" ("id", "teamId", "nodeId", "choice", "wasCorrect", "submittedAt") SELECT "id", "teamId", "nodeId", "choice", "wasCorrect", "submittedAt" FROM "Verdict";
DROP TABLE "Verdict";
ALTER TABLE "new_Verdict" RENAME TO "Verdict";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
