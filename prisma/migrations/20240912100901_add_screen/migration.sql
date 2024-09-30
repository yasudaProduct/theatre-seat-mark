-- CreateTable
CREATE TABLE "screens" (
    "id" SERIAL NOT NULL,
    "theater_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "screens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "screens_created_at_key" ON "screens"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "screens_updated_at_key" ON "screens"("updated_at");

-- AddForeignKey
ALTER TABLE "screens" ADD CONSTRAINT "screens_theater_id_fkey" FOREIGN KEY ("theater_id") REFERENCES "theaters"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
