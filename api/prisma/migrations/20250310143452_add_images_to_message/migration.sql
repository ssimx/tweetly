-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "images" VARCHAR(280)[],
ALTER COLUMN "content" DROP NOT NULL;
