-- CreateTable
CREATE TABLE "billing_plans" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "features" JSONB NOT NULL,

    CONSTRAINT "billing_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "billing_subscriptions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "plan_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "stripe_subscription_id" TEXT,
    "stripe_customer_id" TEXT,
    "current_period_end" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "billing_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "billing_plans_slug_key" ON "billing_plans"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "billing_subscriptions_user_id_key" ON "billing_subscriptions"("user_id");

-- AddForeignKey
ALTER TABLE "billing_subscriptions" ADD CONSTRAINT "billing_subscriptions_plan_id_fkey" FOREIGN KEY ("plan_id") REFERENCES "billing_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Seed plans
INSERT INTO "billing_plans" ("id", "slug", "name", "price_cents", "features") VALUES
  ('plan_student_free', 'student_free', 'Student Free', 0, '{"ai_food_recognition": false, "meal_logs_per_day": 5}'),
  ('plan_student_pro', 'student_pro', 'Student Pro', 999, '{"ai_food_recognition": true, "meal_logs_per_day": 999}'),
  ('plan_professional', 'professional', 'Professional', 4999, '{"professional_profile": true, "coaching_dashboard": true}');
