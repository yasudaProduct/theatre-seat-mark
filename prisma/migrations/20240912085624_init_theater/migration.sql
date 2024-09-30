-- CreateTable
CREATE TABLE "theater" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,

    CONSTRAINT "theater_pkey" PRIMARY KEY ("id")
);
