/*
  Warnings:

  - A unique constraint covering the columns `[alias_id]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN     "alias_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "users_alias_id_key" ON "users"("alias_id");
