-- CreateTable
CREATE TABLE "nutrition_meal_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "meal_type" TEXT NOT NULL,
    "log_date" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_meal_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "nutrition_meal_items" (
    "id" TEXT NOT NULL,
    "meal_log_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "calories" DOUBLE PRECISION NOT NULL,
    "protein" DOUBLE PRECISION NOT NULL,
    "carbs" DOUBLE PRECISION NOT NULL,
    "fat" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "nutrition_meal_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "nutrition_meal_logs_user_id_log_date_idx" ON "nutrition_meal_logs"("user_id", "log_date");

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_meal_logs_user_id_meal_type_log_date_key" ON "nutrition_meal_logs"("user_id", "meal_type", "log_date");

-- CreateIndex
CREATE INDEX "nutrition_meal_items_meal_log_id_idx" ON "nutrition_meal_items"("meal_log_id");

-- AddForeignKey
ALTER TABLE "nutrition_meal_items" ADD CONSTRAINT "nutrition_meal_items_meal_log_id_fkey" FOREIGN KEY ("meal_log_id") REFERENCES "nutrition_meal_logs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
