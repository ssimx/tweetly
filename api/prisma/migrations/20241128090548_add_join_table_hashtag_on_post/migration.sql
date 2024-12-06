/*
  Warnings:

  - You are about to drop the `_Hashtag` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_Hashtag" DROP CONSTRAINT "_Hashtag_A_fkey";

-- DropForeignKey
ALTER TABLE "_Hashtag" DROP CONSTRAINT "_Hashtag_B_fkey";

-- DropTable
DROP TABLE "_Hashtag";

-- CreateTable
CREATE TABLE "HashtagOnPost" (
    "postId" INTEGER NOT NULL,
    "hashtagId" INTEGER NOT NULL,

    CONSTRAINT "HashtagOnPost_pkey" PRIMARY KEY ("postId","hashtagId")
);

-- AddForeignKey
ALTER TABLE "HashtagOnPost" ADD CONSTRAINT "HashtagOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HashtagOnPost" ADD CONSTRAINT "HashtagOnPost_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
