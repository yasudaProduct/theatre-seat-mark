-- CreateTable
CREATE TABLE "seat_review_details" (
    "id" SERIAL NOT NULL,
    "review_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seat_review_details_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "seat_review_details_created_at_key" ON "seat_review_details"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "seat_review_details_updated_at_key" ON "seat_review_details"("updated_at");

-- AddForeignKey
ALTER TABLE "seat_review_details" ADD CONSTRAINT "seat_review_details_review_id_fkey" FOREIGN KEY ("review_id") REFERENCES "seat_reviews"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
