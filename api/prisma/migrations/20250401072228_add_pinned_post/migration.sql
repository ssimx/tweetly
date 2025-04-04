/*
  Warnings:

  - A unique constraint covering the columns `[pinnedPostId]` on the table `Profile` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" ADD COLUMN     "pinnedPostId" INTEGER;

-- CreateIndex
CREATE UNIQUE INDEX "Profile_pinnedPostId_key" ON "Profile"("pinnedPostId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_pinnedPostId_fkey" FOREIGN KEY ("pinnedPostId") REFERENCES "Post"("id") ON DELETE SET NULL ON UPDATE CASCADE;
