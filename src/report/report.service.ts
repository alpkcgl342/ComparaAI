import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Faz 6 — Trend/Rapor özellikleri.
@Injectable()
export class ReportService {
  constructor(private prisma: PrismaService) {}

  // Trend Teknoloji tespiti — SAF SQL, AI çağrısı YOK. Roadmap'in dediği
  // gibi: "haber hacmi + önem skoru + entity sıklığına dayalı basit bir
  // istatistiksel sinyal (AI'a gerek kalmadan SQL ile hesaplanabilir)".
  // Son N gündeki haberlerde geçen entity'leri, haberin önem derecesine
  // göre ağırlıklandırıp sıklığına göre sıralar.
  async trending(days: number, limit: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.$queryRaw<
      {
        entityName: string;
        entityType: string;
        mentionCount: bigint;
        weightedScore: bigint;
      }[]
    >(Prisma.sql`
      SELECT
        ae."entityName" AS "entityName",
        ae."entityType" AS "entityType",
        COUNT(*) AS "mentionCount",
        SUM(
          CASE a."aiImportance"
            WHEN 'kritik' THEN 4
            WHEN 'yuksek' THEN 3
            WHEN 'orta' THEN 2
            WHEN 'dusuk' THEN 1
            ELSE 1
          END
        ) AS "weightedScore"
      FROM "ArticleEntity" ae
      JOIN "Article" a ON a.id = ae."articleId"
      WHERE a."createdAt" >= ${since}
      GROUP BY ae."entityName", ae."entityType"
      ORDER BY "weightedScore" DESC, "mentionCount" DESC
      LIMIT ${limit}
    `);
  }

  // Şirket/teknoloji AI analizi ve rapor üretimi için bağlam toplama —
  // admin panel bunu çağırıp comparaai-ai'ye gönderecek ham veriyi hazırlar.
  async getEntityContext(entityName: string) {
    const articles = await this.prisma.article.findMany({
      where: {
        entities: { some: { entityName: { equals: entityName, mode: 'insensitive' } } },
      },
      select: { id: true, title: true, summary: true, aiImportance: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const products = await this.prisma.product.findMany({
      where: { brand: { equals: entityName, mode: 'insensitive' } },
      select: { id: true, name: true, brand: true, specs: true },
      take: 20,
    });

    return { articles, products };
  }

  async getRecentArticlesForReport(days: number) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    return this.prisma.article.findMany({
      where: { createdAt: { gte: since }, status: 'published' },
      select: { id: true, title: true, summary: true, aiImportance: true },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
  }

  findAll(type?: string) {
    return this.prisma.aiReport.findMany({
      where: type ? { type } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  findLatestByType(type: string) {
    return this.prisma.aiReport.findFirst({
      where: { type },
      orderBy: { createdAt: 'desc' },
    });
  }

  save(data: {
    type: string;
    title?: string;
    content: unknown;
    periodStart?: string;
    periodEnd?: string;
  }) {
    return this.prisma.aiReport.create({
      data: {
        type: data.type,
        title: data.title,
        content: data.content as Prisma.InputJsonValue,
        periodStart: data.periodStart ? new Date(data.periodStart) : undefined,
        periodEnd: data.periodEnd ? new Date(data.periodEnd) : undefined,
      },
    });
  }
}
