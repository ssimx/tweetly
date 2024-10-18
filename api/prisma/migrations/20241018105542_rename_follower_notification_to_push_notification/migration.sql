/*
  Warnings:

  - You are about to drop the `FollowerNotification` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "FollowerNotification" DROP CONSTRAINT "FollowerNotification_notifierId_fkey";

-- DropForeignKey
ALTER TABLE "FollowerNotification" DROP CONSTRAINT "FollowerNotification_receiverId_fkey";

-- DropTable
DROP TABLE "FollowerNotification";

-- CreateTable
CREATE TABLE "PushNotification" (
    "receiverId" INTEGER NOT NULL,
    "notifierId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PushNotification_pkey" PRIMARY KEY ("receiverId","notifierId")
);

-- AddForeignKey
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PushNotification" ADD CONSTRAINT "PushNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
