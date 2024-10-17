/*
  Warnings:

  - You are about to drop the `PostNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('POST', 'REPLY', 'REPOST', 'LIKE', 'FOLLOW');

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_notifierId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_receiverId_fkey";

-- DropTable
DROP TABLE "PostNotification";

-- CreateTable
CREATE TABLE "PostReplyNotification" (
    "postId" INTEGER NOT NULL,
    "notifierId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "type" "NotificationType" NOT NULL DEFAULT 'POST',

    CONSTRAINT "PostReplyNotification_pkey" PRIMARY KEY ("postId","notifierId","receiverId")
);

-- AddForeignKey
ALTER TABLE "PostReplyNotification" ADD CONSTRAINT "PostReplyNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReplyNotification" ADD CONSTRAINT "PostReplyNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostReplyNotification" ADD CONSTRAINT "PostReplyNotification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
