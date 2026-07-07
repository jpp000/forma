-- CreateTable
CREATE TABLE "training_workout_plans" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_workout_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_workout_plan_items" (
    "id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "sets" INTEGER NOT NULL,
    "reps" INTEGER NOT NULL,
    "rest_seconds" INTEGER NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "training_workout_plan_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_workout_plans_user_id_idx" ON "training_workout_plans"("user_id");

-- CreateIndex
CREATE INDEX "training_workout_plan_items_plan_id_idx" ON "training_workout_plan_items"("plan_id");

-- AddForeignKey
ALTER TABLE "training_workout_plan_items" ADD CONSTRAINT "training_workout_plan_items_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "training_workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_workout_plan_items" ADD CONSTRAINT "training_workout_plan_items_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "training_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
