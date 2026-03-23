/*
  Warnings:

  - The `rank` column on the `User` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "Ranks" AS ENUM ('USER', 'MODERATOR', 'ADMIN');

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_addresseeId_fkey";

-- DropForeignKey
ALTER TABLE "Friends" DROP CONSTRAINT "Friends_requesterId_fkey";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "rank",
ADD COLUMN     "rank" "Ranks" NOT NULL DEFAULT 'USER';

-- DropEnum
DROP TYPE "Role";

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friends" ADD CONSTRAINT "Friends_addresseeId_fkey" FOREIGN KEY ("addresseeId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
