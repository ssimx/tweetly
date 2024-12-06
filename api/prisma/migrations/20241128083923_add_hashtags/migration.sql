-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "hashtagId" INTEGER;

-- CreateTable
CREATE TABLE "Hashtag" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Hashtag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_Hashtag" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Hashtag_name_key" ON "Hashtag"("name");

-- CreateIndex
CREATE UNIQUE INDEX "_Hashtag_AB_unique" ON "_Hashtag"("A", "B");

-- CreateIndex
CREATE INDEX "_Hashtag_B_index" ON "_Hashtag"("B");

-- AddForeignKey
ALTER TABLE "_Hashtag" ADD CONSTRAINT "_Hashtag_A_fkey" FOREIGN KEY ("A") REFERENCES "Hashtag"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_Hashtag" ADD CONSTRAINT "_Hashtag_B_fkey" FOREIGN KEY ("B") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;
