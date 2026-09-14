-- CreateTable
CREATE TABLE "Segment" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "minPrice" DECIMAL(65,30),
    "maxPrice" DECIMAL(65,30),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Segment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductAiScore" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "overallScore" DECIMAL(65,30) NOT NULL,
    "performanceScore" DECIMAL(65,30),
    "cameraScore" DECIMAL(65,30),
    "batteryScore" DECIMAL(65,30),
    "softwareScore" DECIMAL(65,30),
    "valueScore" DECIMAL(65,30),
    "useCaseScore" JSONB,
    "futureProofScore" DECIMAL(65,30),
    "aiSummary" TEXT,
    "bestFor" TEXT[],
    "notFor" TEXT[],
    "weaknesses" JSONB,
    "modelVersion" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ProductAiScore_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserProfile" (
    "id" TEXT NOT NULL,
    "persona" TEXT,
    "budgetMin" DECIMAL(65,30),
    "budgetMax" DECIMAL(65,30),
    "priorities" JSONB,
    "followedEntities" TEXT[],
    "techMemory" JSONB,
    "expertiseLevel" TEXT NOT NULL DEFAULT 'normal',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiComparison" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "productIds" TEXT[],
    "scenario" TEXT,
    "result" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiComparison_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiSearchQuery" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "query" TEXT NOT NULL,
    "parsedFilters" JSONB,
    "resultProductIds" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiSearchQuery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleEntity" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityName" TEXT NOT NULL,
    "productId" TEXT,
    "confidence" DECIMAL(65,30),

    CONSTRAINT "ArticleEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ArticleDuplicate" (
    "id" TEXT NOT NULL,
    "articleId" TEXT NOT NULL,
    "duplicateOfArticleId" TEXT NOT NULL,
    "similarityScore" DECIMAL(65,30) NOT NULL,
    "detectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ArticleDuplicate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TechGlossaryTerm" (
    "id" TEXT NOT NULL,
    "term" TEXT NOT NULL,
    "explanationSimple" TEXT,
    "explanationNormal" TEXT,
    "explanationTechnical" TEXT,
    "explanationExpert" TEXT,
    "category" TEXT,
    "relatedTerms" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TechGlossaryTerm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiNotification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "entityName" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "articleId" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiNotification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiReport" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT,
    "content" JSONB NOT NULL,
    "periodStart" DATE,
    "periodEnd" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Segment_key_key" ON "Segment"("key");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAiScore_productId_key" ON "ProductAiScore"("productId");

-- CreateIndex
CREATE INDEX "AiComparison_userId_idx" ON "AiComparison"("userId");

-- CreateIndex
CREATE INDEX "AiSearchQuery_userId_idx" ON "AiSearchQuery"("userId");

-- CreateIndex
CREATE INDEX "ArticleEntity_articleId_idx" ON "ArticleEntity"("articleId");

-- CreateIndex
CREATE INDEX "ArticleEntity_productId_idx" ON "ArticleEntity"("productId");

-- CreateIndex
CREATE INDEX "ArticleDuplicate_articleId_idx" ON "ArticleDuplicate"("articleId");

-- CreateIndex
CREATE INDEX "ArticleDuplicate_duplicateOfArticleId_idx" ON "ArticleDuplicate"("duplicateOfArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "TechGlossaryTerm_term_key" ON "TechGlossaryTerm"("term");

-- CreateIndex
CREATE INDEX "AiNotification_userId_idx" ON "AiNotification"("userId");

-- AddForeignKey
ALTER TABLE "ProductAiScore" ADD CONSTRAINT "ProductAiScore_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleEntity" ADD CONSTRAINT "ArticleEntity_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleEntity" ADD CONSTRAINT "ArticleEntity_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleDuplicate" ADD CONSTRAINT "ArticleDuplicate_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ArticleDuplicate" ADD CONSTRAINT "ArticleDuplicate_duplicateOfArticleId_fkey" FOREIGN KEY ("duplicateOfArticleId") REFERENCES "Article"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiNotification" ADD CONSTRAINT "AiNotification_articleId_fkey" FOREIGN KEY ("articleId") REFERENCES "Article"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- ============================================================================
-- Faz 1 ek işler (Prisma tarafından üretilmez, elle eklendi)
-- ============================================================================

-- pgvector: Faz 2'de haber<->ürün embedding eşleştirmesi için gerekli.
-- Bu migration'da henüz hiçbir vector kolonu eklenmiyor (o iş Faz 2'de,
-- gerçek embedding üretimiyle birlikte yapılacak) — sadece extension açılıyor.
CREATE EXTENSION IF NOT EXISTS vector;

-- Başlangıç segment verisi (Product.segment ile senkron: ekonomik | orta | ust)
INSERT INTO "Segment" ("id", "key", "label", "description")
VALUES
  ('seg_ekonomik', 'ekonomik', 'Ekonomik', 'Bütçe dostu, giriş seviyesi ürünler'),
  ('seg_orta', 'orta', 'Orta Segment', 'Fiyat/performans dengesi gözeten ürünler'),
  ('seg_ust', 'ust', 'Üst Segment', 'Performans/özellik önceliğiyle seçilen, premium ürünler')
ON CONFLICT ("key") DO NOTHING;

-- Row Level Security
-- NOT: NestJS backend Prisma üzerinden doğrudan Postgres bağlantısı kullanıyor
-- (bkz. src/prisma/prisma.service.ts) — bu bağlantı RLS'ten etkilenmez.
-- Bu politikalar, ileride web/admin'den doğrudan Supabase client (anon/authenticated
-- rolüyle) erişim açılırsa devreye girecek savunma katmanıdır.

ALTER TABLE "UserProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "UserProfile kendi satırını görebilir" ON "UserProfile"
  FOR SELECT USING (auth.uid()::text = "id");
CREATE POLICY "UserProfile kendi satırını oluşturabilir" ON "UserProfile"
  FOR INSERT WITH CHECK (auth.uid()::text = "id");
CREATE POLICY "UserProfile kendi satırını güncelleyebilir" ON "UserProfile"
  FOR UPDATE USING (auth.uid()::text = "id") WITH CHECK (auth.uid()::text = "id");

ALTER TABLE "AiComparison" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AiComparison kendi satırını görebilir" ON "AiComparison"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "AiComparison kendi satırını oluşturabilir" ON "AiComparison"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

ALTER TABLE "AiSearchQuery" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AiSearchQuery kendi satırını görebilir" ON "AiSearchQuery"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "AiSearchQuery kendi satırını oluşturabilir" ON "AiSearchQuery"
  FOR INSERT WITH CHECK (auth.uid()::text = "userId");

ALTER TABLE "AiNotification" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "AiNotification kendi satırını görebilir" ON "AiNotification"
  FOR SELECT USING (auth.uid()::text = "userId");
CREATE POLICY "AiNotification kendi satırını güncelleyebilir" ON "AiNotification"
  FOR UPDATE USING (auth.uid()::text = "userId") WITH CHECK (auth.uid()::text = "userId");
