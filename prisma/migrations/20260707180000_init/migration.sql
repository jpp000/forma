-- CreateTable
CREATE TABLE "platform_health_checks" (
    "id" TEXT NOT NULL,
    "checked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "platform_health_checks_pkey" PRIMARY KEY ("id")
);
