/*
  Warnings:

  - The primary key for the `Notification` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `notifierId` on the `Notification` table. All the data in the column will be lost.
  - Added the required column `receiverId` to the `Notification` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_notifierId_fkey";

-- AlterTable
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_pkey",
DROP COLUMN "notifierId",
ADD COLUMN     "receiverId" INTEGER NOT NULL,
ADD CONSTRAINT "Notification_pkey" PRIMARY KEY ("notificationObjectId", "receiverId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
