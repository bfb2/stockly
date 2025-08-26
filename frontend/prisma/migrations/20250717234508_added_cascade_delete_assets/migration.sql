-- DropForeignKey
ALTER TABLE "PaperTradeOrder" DROP CONSTRAINT "PaperTradeOrder_assetId_fkey";

-- AddForeignKey
ALTER TABLE "PaperTradeOrder" ADD CONSTRAINT "PaperTradeOrder_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
