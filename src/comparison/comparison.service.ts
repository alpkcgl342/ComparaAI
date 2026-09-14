import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

// Faz 3 — AI Asistan'ın ürettiği karşılaştırma/öneri sonuçlarını
// AiComparison tablosuna kaydeder (roadmap Faz 1'de oluşturulmuş, şimdiye
// kadar kullanılmıyordu). Şu an web'de gerçek kullanıcı girişi olmadığı
// için userId hep null (misafir kullanım) — Faz 5'te Supabase Auth
// eklenince buraya gerçek kullanıcı id'si geçirilebilir.
@Injectable()
export class ComparisonService {
  constructor(private prisma: PrismaService) {}

  create(data: {
    productIds: string[];
    scenario?: string;
    result: unknown;
    userId?: string;
  }) {
    return this.prisma.aiComparison.create({
      data: {
        productIds: data.productIds,
        scenario: data.scenario,
        result: data.result as Prisma.InputJsonValue,
        userId: data.userId,
      },
    });
  }
}
