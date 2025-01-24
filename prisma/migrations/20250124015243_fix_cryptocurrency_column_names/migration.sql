/*
  Warnings:

  - You are about to drop the column `athDate` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `athPrice` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `atlDate` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `atlPrice` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `high24h` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `high7d` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `low24h` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `low7d` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `marketCap` on the `Cryptocurrency` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `OTPVerification` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `OTPVerification` table. All the data in the column will be lost.
  - You are about to drop the column `hashedOTP` on the `OTPVerification` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `OTPVerification` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `OTPVerification` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `expiresAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `revokedAt` on the `RefreshToken` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `RefreshToken` table. All the data in the column will be lost.
  - Added the required column `ath_date` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `ath_price` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atl_date` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `atl_price` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `high_24h` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `high_7d` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `low_24h` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `low_7d` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `market_cap` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updated_at` to the `Cryptocurrency` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `OTPVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `hashed_otp` to the `OTPVerification` table without a default value. This is not possible if the table is not empty.
  - Added the required column `expires_at` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `RefreshToken` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OTPVerification" DROP CONSTRAINT "OTPVerification_userId_fkey";

-- DropForeignKey
ALTER TABLE "RefreshToken" DROP CONSTRAINT "RefreshToken_userId_fkey";

-- DropIndex
DROP INDEX "OTPVerification_userId_idx";

-- DropIndex
DROP INDEX "RefreshToken_userId_idx";

-- AlterTable
ALTER TABLE "Cryptocurrency" DROP COLUMN "athDate",
DROP COLUMN "athPrice",
DROP COLUMN "atlDate",
DROP COLUMN "atlPrice",
DROP COLUMN "high24h",
DROP COLUMN "high7d",
DROP COLUMN "low24h",
DROP COLUMN "low7d",
DROP COLUMN "marketCap",
ADD COLUMN     "ath_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "ath_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "atl_date" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "atl_price" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "deleted_at" TIMESTAMP(3),
ADD COLUMN     "high_24h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "high_7d" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "low_24h" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "low_7d" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "market_cap" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "OTPVerification" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "hashedOTP",
DROP COLUMN "updatedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "hashed_otp" TEXT NOT NULL,
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "user_id" INTEGER;

-- AlterTable
ALTER TABLE "RefreshToken" DROP COLUMN "createdAt",
DROP COLUMN "expiresAt",
DROP COLUMN "revokedAt",
DROP COLUMN "userId",
ADD COLUMN     "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "expires_at" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "revoked_at" TIMESTAMP(3),
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "deleted_at" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "OTPVerification_user_id_idx" ON "OTPVerification"("user_id");

-- CreateIndex
CREATE INDEX "RefreshToken_user_id_idx" ON "RefreshToken"("user_id");

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OTPVerification" ADD CONSTRAINT "OTPVerification_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
