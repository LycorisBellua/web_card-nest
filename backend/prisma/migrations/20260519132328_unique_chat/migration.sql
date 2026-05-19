/*
  Warnings:

  - A unique constraint covering the columns `[userAId,userBId]` on the table `Chat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Chat_userAId_userBId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "Chat_userAId_userBId_key" ON "Chat"("userAId", "userBId");
