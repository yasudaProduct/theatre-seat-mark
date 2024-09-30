/*
  Warnings:

  - You are about to drop the `_ArticleToUser` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "_ArticleToUser" DROP CONSTRAINT "_ArticleToUser_A_fkey";

-- DropForeignKey
ALTER TABLE "_ArticleToUser" DROP CONSTRAINT "_ArticleToUser_B_fkey";

-- DropTable
DROP TABLE "_ArticleToUser";

-- CreateTable
CREATE TABLE "bookmarks" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "review_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bookmarks_user_id_review_id_key" ON "bookmarks"("user_id", "review_id");

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookmarks" ADD CONSTRAINT "bookmarks_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "seat_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
