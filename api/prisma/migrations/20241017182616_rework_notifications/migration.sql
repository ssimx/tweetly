/*
  Warnings:

  - You are about to drop the `PostReplyNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "PostReplyNotification" DROP CONSTRAINT "PostReplyNotification_notifierId_fkey";

-- DropForeignKey
ALTER TABLE "PostReplyNotification" DROP CONSTRAINT "PostReplyNotification_postId_fkey";

-- DropForeignKey
ALTER TABLE "PostReplyNotification" DROP CONSTRAINT "PostReplyNotification_receiverId_fkey";

-- DropTable
DROP TABLE "PostReplyNotification";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateTable
CREATE TABLE "NotificationType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,

    CONSTRAINT "NotificationType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostNotification" (
    "typeId" INTEGER NOT NULL,
    "postId" INTEGER NOT NULL,
    "notifierId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "PostNotification_pkey" PRIMARY KEY ("typeId","postId","notifierId","receiverId")
);

-- CreateTable
CREATE TABLE "FollowNotification" (
    "typeId" INTEGER NOT NULL,
    "notifierId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FollowNotification_pkey" PRIMARY KEY ("typeId","notifierId","receiverId")
);

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "NotificationType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowNotification" ADD CONSTRAINT "FollowNotification_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "NotificationType"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowNotification" ADD CONSTRAINT "FollowNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FollowNotification" ADD CONSTRAINT "FollowNotification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
