-- CreateEnum
CREATE TYPE "BlogContentType" AS ENUM ('BLOG', 'VLOG');

-- CreateTable
CREATE TABLE "blog_posts" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "excerpt" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readTime" TEXT NOT NULL DEFAULT '2 min read',
    "image" TEXT,
    "sections" JSONB NOT NULL,
    "contentType" "BlogContentType" NOT NULL DEFAULT 'BLOG',
    "videoUrl" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "blog_posts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "blog_posts_slug_key" ON "blog_posts"("slug");

-- CreateIndex
CREATE INDEX "blog_posts_published_date_idx" ON "blog_posts"("published", "date");

-- CreateIndex
CREATE INDEX "blog_posts_contentType_idx" ON "blog_posts"("contentType");
