/*
  Warnings:

  - A unique constraint covering the columns `[created_at]` on the table `theaters` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[updated_at]` on the table `theaters` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "theaters_created_at_key" ON "theaters"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "theaters_updated_at_key" ON "theaters"("updated_at");
