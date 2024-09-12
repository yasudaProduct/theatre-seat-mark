-- CreateTable
CREATE TABLE "seat_reviews" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "screen_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seat_reviews_created_at_key" ON "seat_reviews"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "seat_reviews_updated_at_key" ON "seat_reviews"("updated_at");

-- AddForeignKey
ALTER TABLE "seat_reviews" ADD CONSTRAINT "seat_reviews_screen_id_fkey" FOREIGN KEY ("screen_id") REFERENCES "screens"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
