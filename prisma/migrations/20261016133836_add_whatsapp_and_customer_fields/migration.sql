-- AlterEnum
ALTER TYPE "PaymentMethod" ADD VALUE 'WHATSAPP';

-- AlterTable
ALTER TABLE "orders" ADD COLUMN     "customerName" TEXT,
ADD COLUMN     "note" TEXT,
ADD COLUMN     "phone" TEXT;
