/*
  Warnings:

  - You are about to drop the `Chat` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Message` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userAId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userBId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_chatId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "LobbyMessage" ADD COLUMN     "moderated" BOOLEAN NOT NULL DEFAULT false;

-- DropTable
DROP TABLE "Chat";

-- DropTable
DROP TABLE "Message";

-- CreateTable
CREATE TABLE "DMChat" (
    "userAId" TEXT NOT NULL,
    "userBId" TEXT NOT NULL,
    "id" TEXT NOT NULL,

    CONSTRAINT "DMChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DMMessage" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "message" VARCHAR(500) NOT NULL,
    "senderId" TEXT NOT NULL,

    CONSTRAINT "DMMessage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DMChat_userBId_idx" ON "DMChat"("userBId");

-- CreateIndex
CREATE UNIQUE INDEX "DMChat_userAId_userBId_key" ON "DMChat"("userAId", "userBId");

-- CreateIndex
CREATE INDEX "DMMessage_chatId_idx" ON "DMMessage"("chatId");

-- AddForeignKey
ALTER TABLE "DMChat" ADD CONSTRAINT "DMChat_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMChat" ADD CONSTRAINT "DMChat_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "DMChat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DMMessage" ADD CONSTRAINT "DMMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
