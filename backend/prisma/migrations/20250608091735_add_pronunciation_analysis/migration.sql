-- CreateTable
CREATE TABLE "Unit" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "metadata" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "PronunciationAnalysis" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "userId" TEXT NOT NULL,
    "unitId" INTEGER NOT NULL,
    "overallScore" REAL NOT NULL,
    "accuracyScore" REAL NOT NULL,
    "fluencyScore" REAL NOT NULL,
    "prosodyScore" REAL NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PronunciationAnalysis_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "PronunciationAnalysis_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PronunciationFinding" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "analysisId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "details" TEXT NOT NULL DEFAULT '{}',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PronunciationFinding_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "PronunciationAnalysis" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
