-- AlterTable
ALTER TABLE "Article" ADD COLUMN "seoMetaDescription" TEXT;
ALTER TABLE "Article" ADD COLUMN "tags" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[];
