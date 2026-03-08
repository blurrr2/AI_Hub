/*
  Warnings:

  - You are about to drop the column `category` on the `news_articles` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "news_articles" DROP COLUMN "category",
ADD COLUMN     "tag" TEXT NOT NULL DEFAULT 'research';

-- CreateTable
CREATE TABLE "bookmarked_articles" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "articleId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bookmarked_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarked_articles_userId_articleId_key" ON "bookmarked_articles"("userId", "articleId");

-- AddForeignKey
ALTER TABLE "bookmarked_articles" ADD CONSTRAINT "bookmarked_articles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarked_articles" ADD CONSTRAINT "bookmarked_articles_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "news_articles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
