/*
  Warnings:

  - Made the column `userAId` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `userBId` on table `Chat` required. This step will fail if there are existing NULL values in that column.
  - Made the column `senderId` on table `Message` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userAId_fkey";

-- DropForeignKey
ALTER TABLE "Chat" DROP CONSTRAINT "Chat_userBId_fkey";

-- DropForeignKey
ALTER TABLE "Message" DROP CONSTRAINT "Message_senderId_fkey";

-- AlterTable
ALTER TABLE "Chat" ALTER COLUMN "userAId" SET NOT NULL,
ALTER COLUMN "userBId" SET NOT NULL;

-- AlterTable
ALTER TABLE "Message" ALTER COLUMN "senderId" SET NOT NULL;

-- CreateTable
CREATE TABLE "LobbyMessage" (
    "id" TEXT NOT NULL,
    "senderId" TEXT,
    "message" VARCHAR(500) NOT NULL,

    CONSTRAINT "LobbyMessage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LobbyBan" (
    "userId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LobbyBan_pkey" PRIMARY KEY ("userId")
);

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userAId_fkey" FOREIGN KEY ("userAId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Chat" ADD CONSTRAINT "Chat_userBId_fkey" FOREIGN KEY ("userBId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyMessage" ADD CONSTRAINT "LobbyMessage_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LobbyBan" ADD CONSTRAINT "LobbyBan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
