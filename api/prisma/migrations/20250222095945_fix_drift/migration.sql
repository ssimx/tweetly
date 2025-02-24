/*
  Warnings:

  - Made the column `password` on table `TemporaryUser` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "TemporaryUser" ALTER COLUMN "password" SET NOT NULL;
