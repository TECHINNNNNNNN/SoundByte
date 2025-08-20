-- CreateTable
CREATE TABLE "public"."digests" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "audioLength" INTEGER NOT NULL,
    "deliveryEmail" TEXT,
    "useDefaultEmail" BOOLEAN NOT NULL DEFAULT true,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "nextGenerationAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "digests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."digest_deliveries" (
    "id" TEXT NOT NULL,
    "digestId" TEXT NOT NULL,
    "audioUrl" TEXT NOT NULL,
    "transcript" TEXT NOT NULL,
    "searchResults" JSONB NOT NULL,
    "delivered" BOOLEAN NOT NULL DEFAULT false,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "digest_deliveries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "digests_userId_idx" ON "public"."digests"("userId");

-- CreateIndex
CREATE INDEX "digests_isActive_nextGenerationAt_idx" ON "public"."digests"("isActive", "nextGenerationAt");

-- CreateIndex
CREATE INDEX "digest_deliveries_digestId_idx" ON "public"."digest_deliveries"("digestId");

-- CreateIndex
CREATE INDEX "digest_deliveries_createdAt_idx" ON "public"."digest_deliveries"("createdAt");

-- AddForeignKey
ALTER TABLE "public"."digests" ADD CONSTRAINT "digests_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."digest_deliveries" ADD CONSTRAINT "digest_deliveries_digestId_fkey" FOREIGN KEY ("digestId") REFERENCES "public"."digests"("id") ON DELETE CASCADE ON UPDATE CASCADE;
