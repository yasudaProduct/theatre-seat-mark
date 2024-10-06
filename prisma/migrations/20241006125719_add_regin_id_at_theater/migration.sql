-- AlterTable
ALTER TABLE "theaters" ADD COLUMN     "region_id" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "url" TEXT;

-- AddForeignKey
ALTER TABLE "theaters" ADD CONSTRAINT "theaters_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "region"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
