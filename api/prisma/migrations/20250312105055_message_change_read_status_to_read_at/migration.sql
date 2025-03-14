/*
  Warnings:

  - You are about to drop the column `readStatus` on the `Message` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Message" DROP COLUMN "readStatus",
ADD COLUMN     "readAt" TIMESTAMP(3);
