-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");
