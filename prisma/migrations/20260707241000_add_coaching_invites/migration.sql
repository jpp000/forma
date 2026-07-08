-- CreateTable
CREATE TABLE "coaching_invites" (
    "id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "student_email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "accepted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaching_links" (
    "id" TEXT NOT NULL,
    "professional_user_id" TEXT NOT NULL,
    "student_user_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "coaching_links_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coaching_invites_token_key" ON "coaching_invites"("token");

-- CreateIndex
CREATE INDEX "coaching_invites_student_email_idx" ON "coaching_invites"("student_email");

-- CreateIndex
CREATE UNIQUE INDEX "coaching_links_professional_user_id_student_user_id_key" ON "coaching_links"("professional_user_id", "student_user_id");

-- CreateIndex
CREATE INDEX "coaching_links_professional_user_id_idx" ON "coaching_links"("professional_user_id");
