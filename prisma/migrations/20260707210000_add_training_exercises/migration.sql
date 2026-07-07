-- CreateTable
CREATE TABLE "training_exercises" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "muscle_group" TEXT NOT NULL,
    "equipment" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_exercises_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_exercises_user_id_idx" ON "training_exercises"("user_id");
