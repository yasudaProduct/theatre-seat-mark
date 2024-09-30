/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `screens` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[seat_name]` on the table `seat_reviews` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "screens_created_at_key";

-- DropIndex
DROP INDEX "screens_updated_at_key";

-- DropIndex
DROP INDEX "seat_reviews_created_at_key";

-- DropIndex
DROP INDEX "seat_reviews_review_key";

-- DropIndex
DROP INDEX "seat_reviews_updated_at_key";

-- DropIndex
DROP INDEX "theaters_created_at_key";

-- DropIndex
DROP INDEX "theaters_updated_at_key";

-- CreateIndex
CREATE UNIQUE INDEX "screens_name_key" ON "screens"("name");

-- CreateIndex
CREATE UNIQUE INDEX "seat_reviews_seat_name_key" ON "seat_reviews"("seat_name");

-- AddForeignKey
ALTER TABLE "seat_reviews" ADD CONSTRAINT "seat_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
