-- AlterTable
ALTER TABLE "public"."digests" ADD COLUMN     "lastGeneratedAt" TIMESTAMP(3),
ADD COLUMN     "preferredHour" INTEGER NOT NULL DEFAULT 8,
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'UTC';
