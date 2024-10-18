/*
  Warnings:

  - The primary key for the `PostNotification` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- AlterTable
ALTER TABLE "PostNotification" DROP CONSTRAINT "PostNotification_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "PostNotification_pkey" PRIMARY KEY ("id");
