/*
  Warnings:

  - You are about to drop the `seat_review_details` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[review]` on the table `seat_reviews` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `review` to the `seat_reviews` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seat_name` to the `seat_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seat_review_details" DROP CONSTRAINT "seat_review_details_review_id_fkey";

-- AlterTable
ALTER TABLE "seat_reviews" ADD COLUMN     "review" TEXT NOT NULL,
ADD COLUMN     "seat_name" TEXT NOT NULL;

-- DropTable
DROP TABLE "seat_review_details";

-- CreateIndex
CREATE UNIQUE INDEX "seat_reviews_review_key" ON "seat_reviews"("review");
