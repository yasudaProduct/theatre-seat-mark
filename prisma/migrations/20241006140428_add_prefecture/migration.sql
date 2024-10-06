/*
  Warnings:

  - Added the required column `prefecture_id` to the `theaters` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "theaters" ADD COLUMN     "prefecture_id" INTEGER NOT NULL,
ADD COLUMN     "url" TEXT;

-- AddForeignKey
ALTER TABLE "theaters" ADD CONSTRAINT "theaters_prefecture_id_fkey" FOREIGN KEY ("prefecture_id") REFERENCES "prefectures"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
