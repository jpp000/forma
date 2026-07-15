-- CreateTable
CREATE TABLE "nutrition_plan_templates" (
    "id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "daily_calories" INTEGER NOT NULL,
    "daily_protein" DOUBLE PRECISION NOT NULL,
    "daily_carbs" DOUBLE PRECISION NOT NULL,
    "daily_fat" DOUBLE PRECISION NOT NULL,
    "menu_json" JSONB,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_plan_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_plan_templates_professional_user_id_idx" ON "nutrition_plan_templates"("professional_user_id");

-- CreateTable
CREATE TABLE "training_periodizations" (
    "id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_periodizations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_periodizations_professional_user_id_idx" ON "training_periodizations"("professional_user_id");

-- CreateTable
CREATE TABLE "training_periodization_blocks" (
    "id" TEXT NOT NULL,
    "periodization_id" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "template_id" TEXT NOT NULL,
    "duration_days" INTEGER NOT NULL,

    CONSTRAINT "training_periodization_blocks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_periodization_blocks_periodization_id_idx" ON "training_periodization_blocks"("periodization_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_periodization_blocks_periodization_id_position_key" ON "training_periodization_blocks"("periodization_id", "position");

-- CreateTable
CREATE TABLE "training_periodization_assignments" (
    "id" TEXT NOT NULL,
    "periodization_id" TEXT NOT NULL,
    "student_user_id" TEXT NOT NULL,
    "started_on" DATE NOT NULL,
    "active_position" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "training_periodization_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "training_periodization_assignments_student_user_id_idx" ON "training_periodization_assignments"("student_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "training_periodization_assignments_periodization_id_student_user_id_key" ON "training_periodization_assignments"("periodization_id", "student_user_id");

-- AddForeignKey
ALTER TABLE "training_periodization_blocks" ADD CONSTRAINT "training_periodization_blocks_periodization_id_fkey" FOREIGN KEY ("periodization_id") REFERENCES "training_periodizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "training_periodization_assignments" ADD CONSTRAINT "training_periodization_assignments_periodization_id_fkey" FOREIGN KEY ("periodization_id") REFERENCES "training_periodizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
