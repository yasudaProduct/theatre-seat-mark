/*
  Warnings:

  - You are about to drop the `theater` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "theater";

-- CreateTable
CREATE TABLE "theaters" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "theaters_pkey" PRIMARY KEY ("id")
);
