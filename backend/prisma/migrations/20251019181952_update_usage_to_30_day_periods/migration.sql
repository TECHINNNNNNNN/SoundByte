-- Migration: Update Usage model to support 30-day billing cycles
-- This migration changes from calendar month (YYYY-MM) to exact 30-day periods

-- Step 1: Add new columns (nullable initially for data migration)
ALTER TABLE "public"."usage" 
  ADD COLUMN "periodStart" TIMESTAMP(3),
  ADD COLUMN "periodEnd" TIMESTAMP(3),
  ADD COLUMN "allocatedTokens" INTEGER NOT NULL DEFAULT 0;

-- Step 2: Migrate existing data from "period" string to date ranges
-- Convert "2025-10" to "2025-10-01 00:00:00" through "2025-10-31 23:59:59"
UPDATE "public"."usage"
SET 
  "periodStart" = TO_TIMESTAMP(period || '-01', 'YYYY-MM-DD'),
  "periodEnd" = (TO_TIMESTAMP(period || '-01', 'YYYY-MM-DD') + INTERVAL '1 month');

-- Step 3: Make periodStart and periodEnd NOT NULL (now that data is migrated)
ALTER TABLE "public"."usage" 
  ALTER COLUMN "periodStart" SET NOT NULL,
  ALTER COLUMN "periodEnd" SET NOT NULL;

-- Step 4: Update tokenLimit default from 500000 to 10000 (free tier default)
ALTER TABLE "public"."usage" 
  ALTER COLUMN "tokenLimit" SET DEFAULT 10000;

-- Step 5: Drop old unique constraint and index on "period"
DROP INDEX IF EXISTS "usage_userId_period_key";
DROP INDEX IF EXISTS "usage_period_idx";

-- Step 6: Create new unique constraint and index on periodStart
CREATE UNIQUE INDEX "usage_userId_periodStart_key" ON "public"."usage"("userId", "periodStart");
CREATE INDEX "usage_periodEnd_idx" ON "public"."usage"("periodEnd");

-- Step 7: Drop the old "period" column (no longer needed)
ALTER TABLE "public"."usage" DROP COLUMN "period";

