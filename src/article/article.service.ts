import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ArticleService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    title: string;
    slug: string;
    summary?: string;
    content: string;
    imageUrl?: string;
    author?: string;
    status?: string;
    isPublished?: boolean;
    publishedAt?: Date;
  }) {
    const status = data.status ?? 'draft';

    return this.prisma.article.create({
      data: {
        ...data,
        status,
        isPublished: status === 'published',
        publishedAt:
          status === 'published'
            ? data.publishedAt ?? new Date()
            : null,
      },
    });
  }

  findAll() {
    return this.prisma.article.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  findPublished() {
    return this.prisma.article.findMany({
      where: {
        status: 'published',
      },
      orderBy: {
        publishedAt: 'desc',
      },
    });
  }

  findOne(id: string) {
    return this.prisma.article.findUnique({
      where: { id },
      include: {
        entities: { include: { product: true } },
      },
    });
  }

  // Faz 2 — Haberden bilgi çıkarma (NER) + Haber<->Ürün bağlantısı.
  // comparaai-ai'nin /extract-entities yanıtını (admin panelden, tarayıcıdan
  // doğrudan çağrılmış) kaydeder. Yeniden çalıştırılabilir olsun diye önce
  // bu makaleye ait eski entity'leri siler.
  async saveEntities(
    articleId: string,
    entities: {
      entity_type: string;
      entity_name: string;
      product_id?: string | null;
      confidence?: number | null;
    }[],
  ) {
    await this.prisma.articleEntity.deleteMany({ where: { articleId } });

    if (entities.length === 0) {
      return [];
    }

    await this.prisma.articleEntity.createMany({
      data: entities.map((e) => ({
        articleId,
        entityType: e.entity_type,
        entityName: e.entity_name,
        productId: e.product_id ?? null,
        confidence: e.confidence ?? null,
      })),
    });

    return this.prisma.articleEntity.findMany({
      where: { articleId },
      include: { product: true },
    });
  }

  findBySlug(slug: string) {
    return this.prisma.article.findUnique({
      where: { slug },
    });
  }

  update(
    id: string,
    data: Partial<{
      title: string;
      slug: string;
      summary: string;
      content: string;
      imageUrl: string;
      author: string;
      status: string;
      isPublished: boolean;
      publishedAt: Date;
      aiImportance: string;
      aiWhyItMatters: string;
      aiWhoItAffects: string;
    }>,
  ) {
    const updateData: {
      title?: string;
      slug?: string;
      summary?: string;
      content?: string;
      imageUrl?: string;
      author?: string;
      status?: string;
      isPublished?: boolean;
      publishedAt?: Date | null;
    } = {
      ...data,
    };

    if (data.status === 'published') {
      updateData.isPublished = true;
      updateData.publishedAt = data.publishedAt ?? new Date();
    }

    if (data.status === 'draft') {
      updateData.isPublished = false;
      updateData.publishedAt = null;
    }

    if (data.status === 'pending') {
      updateData.isPublished = false;
      updateData.publishedAt = null;
    }

    return this.prisma.article.update({
      where: { id },
      data: updateData,
    });
  }

  remove(id: string) {
    return this.prisma.article.delete({
      where: { id },
    });
  }
}