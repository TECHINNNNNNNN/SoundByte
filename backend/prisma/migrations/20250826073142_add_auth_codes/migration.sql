-- CreateTable
CREATE TABLE "public"."auth_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "auth_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "auth_codes_code_key" ON "public"."auth_codes"("code");

-- CreateIndex
CREATE INDEX "auth_codes_code_idx" ON "public"."auth_codes"("code");

-- CreateIndex
CREATE INDEX "auth_codes_expires_idx" ON "public"."auth_codes"("expires");
