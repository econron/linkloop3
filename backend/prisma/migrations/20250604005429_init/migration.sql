-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastLoginAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "UnitProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "unitId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "lastAttempted" DATETIME NOT NULL,
    "completedAt" DATETIME,
    CONSTRAINT "UnitProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "PhonemeProgress" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "averageScore" REAL NOT NULL,
    "bestScore" REAL NOT NULL,
    "lastScore" REAL NOT NULL,
    "lastAttempted" DATETIME NOT NULL,
    CONSTRAINT "PhonemeProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);