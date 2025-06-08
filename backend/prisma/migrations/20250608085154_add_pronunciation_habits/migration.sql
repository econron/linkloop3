-- CreateTable
CREATE TABLE "PronunciationHabit" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "phoneme" TEXT NOT NULL,
    "confusedWith" TEXT NOT NULL,
    "accuracyScore" REAL NOT NULL,
    "lastOccurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PronunciationHabit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PronunciationHabit_userId_lastOccurredAt_idx" ON "PronunciationHabit"("userId", "lastOccurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PronunciationHabit_userId_phoneme_confusedWith_key" ON "PronunciationHabit"("userId", "phoneme", "confusedWith");
