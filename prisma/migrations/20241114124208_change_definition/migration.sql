/*
  Warnings:

  - You are about to drop the column `screen_id` on the `seat_reviews` table. All the data in the column will be lost.
  - Added the required column `seat_id` to the `seat_reviews` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "seat_reviews" DROP CONSTRAINT "seat_reviews_screen_id_fkey";

-- AlterTable
ALTER TABLE "seat_reviews" DROP COLUMN "screen_id",
ADD COLUMN     "seat_id" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "seats" (
    "id" SERIAL NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "row" TEXT NOT NULL,
    "column" INTEGER NOT NULL,

    CONSTRAINT "seats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seats_row_key" ON "seats"("row");

-- AddForeignKey
ALTER TABLE "seats" ADD CONSTRAINT "seats_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seat_reviews" ADD CONSTRAINT "seat_reviews_seat_id_fkey" FOREIGN KEY ("seat_id") REFERENCES "seats"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
