/*
  Warnings:

  - A unique constraint covering the columns `[requesterId,addresseeId]` on the table `Friend` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Friend_requesterId_addresseeId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Friend_requesterId_addresseeId_key" ON "Friend"("requesterId", "addresseeId");
