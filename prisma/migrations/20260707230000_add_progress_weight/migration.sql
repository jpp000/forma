-- CreateTable
CREATE TABLE "progress_weight_entries" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "weight_kg" DOUBLE PRECISION NOT NULL,
    "log_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_weight_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_weight_entries_user_id_log_date_idx" ON "progress_weight_entries"("user_id", "log_date");

-- CreateIndex
CREATE UNIQUE INDEX "progress_weight_entries_user_id_log_date_key" ON "progress_weight_entries"("user_id", "log_date");
