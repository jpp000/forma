-- AlterTable
ALTER TABLE "training_workout_plans" ADD COLUMN "prescribed_by_user_id" TEXT;

-- CreateIndex
CREATE INDEX "training_workout_plans_prescribed_by_user_id_idx" ON "training_workout_plans"("prescribed_by_user_id");

-- CreateTable
CREATE TABLE "training_workout_templates" (
    "id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "items" JSONB NOT NULL,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_workout_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_workout_templates_professional_user_id_idx" ON "training_workout_templates"("professional_user_id");
