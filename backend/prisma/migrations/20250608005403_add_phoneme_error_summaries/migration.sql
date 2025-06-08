-- CreateTable
CREATE TABLE "PhonemeErrorSummary" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "intendedPhoneme" TEXT NOT NULL,
    "actualPhoneme" TEXT NOT NULL,
    "errorCount" INTEGER NOT NULL DEFAULT 1,
    "lastOccurredAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PhonemeErrorSummary_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "PhonemeErrorSummary_userId_lastOccurredAt_idx" ON "PhonemeErrorSummary"("userId", "lastOccurredAt");

-- CreateIndex
CREATE UNIQUE INDEX "PhonemeErrorSummary_userId_intendedPhoneme_actualPhoneme_key" ON "PhonemeErrorSummary"("userId", "intendedPhoneme", "actualPhoneme");
