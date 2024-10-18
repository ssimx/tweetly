/*
  Warnings:

  - You are about to drop the `FollowNotification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `PostNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FollowNotification" DROP CONSTRAINT "FollowNotification_notifierId_fkey";

-- DropForeignKey
ALTER TABLE "FollowNotification" DROP CONSTRAINT "FollowNotification_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "FollowNotification" DROP CONSTRAINT "FollowNotification_typeId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_notifierId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_receiverId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_typeId_fkey";

-- DropTable
DROP TABLE "FollowNotification";

-- DropTable
DROP TABLE "PostNotification";

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "typeId" INTEGER NOT NULL,
    "postId" INTEGER,
    "notifierId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "NotificationType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
