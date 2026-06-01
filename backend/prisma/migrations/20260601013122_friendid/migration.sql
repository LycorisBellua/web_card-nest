/*
  Warnings:

  - The primary key for the `Friend` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - A unique constraint covering the columns `[friendshipId]` on the table `DMChat` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `friendshipId` to the `DMChat` table without a default value. This is not possible if the table is not empty.
  - The required column `id` was added to the `Friend` table with a prisma-level default value. This is not possible if the table is not empty. Please add this column as optional, then populate it before making it required.

*/
-- AlterTable
ALTER TABLE "DMChat" ADD COLUMN     "friendshipId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Friend" DROP CONSTRAINT "Friend_pkey",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Friend_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "DMChat_friendshipId_key" ON "DMChat"("friendshipId");

-- CreateIndex
CREATE INDEX "Friend_requesterId_addresseeId_idx" ON "Friend"("requesterId", "addresseeId");

-- AddForeignKey
ALTER TABLE "DMChat" ADD CONSTRAINT "DMChat_friendshipId_fkey" FOREIGN KEY ("friendshipId") REFERENCES "Friend"("id") ON DELETE CASCADE ON UPDATE CASCADE;
