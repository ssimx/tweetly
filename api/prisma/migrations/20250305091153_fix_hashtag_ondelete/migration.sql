-- DropForeignKey
ALTER TABLE "HashtagOnPost" DROP CONSTRAINT "HashtagOnPost_hashtagId_fkey";

-- DropForeignKey
ALTER TABLE "HashtagOnPost" DROP CONSTRAINT "HashtagOnPost_postId_fkey";

-- AddForeignKey
ALTER TABLE "HashtagOnPost" ADD CONSTRAINT "HashtagOnPost_hashtagId_fkey" FOREIGN KEY ("hashtagId") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HashtagOnPost" ADD CONSTRAINT "HashtagOnPost_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
