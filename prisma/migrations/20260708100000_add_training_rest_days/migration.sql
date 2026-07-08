-- AlterTable
ALTER TABLE "progress_streaks" ADD COLUMN "grace_week_key" TEXT,
ADD COLUMN "grace_gaps_used" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "progress_training_rest_days" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rest_date" DATE NOT NULL,
    "source" TEXT NOT NULL DEFAULT 'explicit',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "progress_training_rest_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "progress_training_rest_days_user_id_rest_date_idx" ON "progress_training_rest_days"("user_id", "rest_date");

-- CreateIndex
CREATE UNIQUE INDEX "progress_training_rest_days_user_id_rest_date_key" ON "progress_training_rest_days"("user_id", "rest_date");

-- AddForeignKey
ALTER TABLE "progress_training_rest_days" ADD CONSTRAINT "progress_training_rest_days_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "identity_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
