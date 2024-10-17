/*
  Warnings:

  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_notificationObjectId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_receiverId_fkey";

-- DropTable
DROP TABLE "Notification";

-- CreateTable
CREATE TABLE "PostNotification" (
    "notificationObjectId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PostNotification_pkey" PRIMARY KEY ("notificationObjectId","postId","receiverId")
);

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_notificationObjectId_fkey" FOREIGN KEY ("notificationObjectId") REFERENCES "NotificationObject"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
