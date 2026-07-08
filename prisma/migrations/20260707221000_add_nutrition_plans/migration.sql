-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" TEXT NOT NULL,
    "student_user_id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "daily_calories" INTEGER NOT NULL,
    "daily_protein" DOUBLE PRECISION NOT NULL,
    "daily_carbs" DOUBLE PRECISION NOT NULL,
    "daily_fat" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_plans_student_user_id_idx" ON "nutrition_plans"("student_user_id");
