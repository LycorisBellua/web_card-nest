-- DropIndex
DROP INDEX "Friend_addresseeId_idx";

-- CreateIndex
CREATE INDEX "Friend_addresseeId_requesterId_idx" ON "Friend"("addresseeId", "requesterId");
