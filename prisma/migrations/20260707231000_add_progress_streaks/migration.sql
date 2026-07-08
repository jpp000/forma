-- CreateTable
CREATE TABLE "progress_streaks" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "streak_type" TEXT NOT NULL,
    "current_streak" INTEGER NOT NULL DEFAULT 0,
    "longest_streak" INTEGER NOT NULL DEFAULT 0,
    "last_active_date" DATE,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_streaks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "progress_streaks_user_id_streak_type_key" ON "progress_streaks"("user_id", "streak_type");
