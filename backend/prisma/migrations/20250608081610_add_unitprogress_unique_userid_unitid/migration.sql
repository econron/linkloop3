/*
  Warnings:

  - A unique constraint covering the columns `[userId,unitId]` on the table `UnitProgress` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UnitProgress_userId_unitId_key" ON "UnitProgress"("userId", "unitId");
