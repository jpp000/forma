-- CreateTable
CREATE TABLE "training_workout_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT,
    "completed_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "training_workout_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "training_workout_session_exercises" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "exercise_id" TEXT NOT NULL,
    "sets" JSONB NOT NULL,

    CONSTRAINT "training_workout_session_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_workout_sessions_user_id_completed_at_idx" ON "training_workout_sessions"("user_id", "completed_at");

-- CreateIndex
CREATE INDEX "training_workout_session_exercises_session_id_idx" ON "training_workout_session_exercises"("session_id");

-- AddForeignKey
ALTER TABLE "training_workout_sessions" ADD CONSTRAINT "training_workout_sessions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "training_workout_plans"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_workout_session_exercises" ADD CONSTRAINT "training_workout_session_exercises_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "training_workout_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_workout_session_exercises" ADD CONSTRAINT "training_workout_session_exercises_exercise_id_fkey" FOREIGN KEY ("exercise_id") REFERENCES "training_exercises"("id") ON DELETE CASCADE ON UPDATE CASCADE;
