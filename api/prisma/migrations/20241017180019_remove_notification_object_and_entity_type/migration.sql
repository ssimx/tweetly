/*
  Warnings:

  - The primary key for the `PostNotification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `notificationObjectId` on the `PostNotification` table. All the data in the column will be lost.
  - You are about to drop the `EntityType` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `NotificationObject` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `notifierId` to the `PostNotification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "NotificationObject" DROP CONSTRAINT "NotificationObject_actorId_fkey";

-- DropForeignKey
ALTER TABLE "NotificationObject" DROP CONSTRAINT "NotificationObject_entityTypeId_fkey";

-- DropForeignKey
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_notificationObjectId_fkey";

-- AlterTable
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_pkey",
DROP COLUMN "notificationObjectId",
ADD COLUMN     "notifierId" INTEGER NOT NULL,
ADD CONSTRAINT "PostNotification_pkey" PRIMARY KEY ("postId", "notifierId", "receiverId");

-- DropTable
DROP TABLE "EntityType";

-- DropTable
DROP TABLE "NotificationObject";

-- DropEnum
DROP TYPE "EntityTypes";

-- AddForeignKey
ALTER TABLE "PostNotification" ADD CONSTRAINT "PostNotification_notifierId_fkey" FOREIGN KEY ("notifierId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
