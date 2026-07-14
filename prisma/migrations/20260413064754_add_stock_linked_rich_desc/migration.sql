-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "deliveryCharge" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "faqData" TEXT,
ADD COLUMN     "richDescription" TEXT,
ADD COLUMN     "stock" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "LinkedProduct" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "startingPrice" DOUBLE PRECISION NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LinkedProduct_pkey" PRIMARY KEY ("id")
);
