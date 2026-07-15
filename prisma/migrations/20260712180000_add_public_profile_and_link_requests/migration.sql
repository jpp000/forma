-- AlterTable
ALTER TABLE "coaching_professional_profiles"
ADD COLUMN "display_name" TEXT,
ADD COLUMN "bio" TEXT,
ADD COLUMN "slug" TEXT,
ADD COLUMN "is_published" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "coaching_professional_profiles_slug_key"
ON "coaching_professional_profiles"("slug");

-- CreateTable
CREATE TABLE "coaching_link_requests" (
    "id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "student_user_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolved_at" TIMESTAMP(3),

    CONSTRAINT "coaching_link_requests_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "coaching_link_requests_professional_user_id_status_idx"
ON "coaching_link_requests"("professional_user_id", "status");

-- CreateIndex
CREATE INDEX "coaching_link_requests_student_user_id_status_idx"
ON "coaching_link_requests"("student_user_id", "status");
