import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { SaveAiScoreDto } from './dto/ai-score.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(private prisma: PrismaService) {}

  create(createProductDto: CreateProductDto) {
  return this.prisma.product.create({
    data: {
      name: createProductDto.name,
      brand: createProductDto.brand,
      categoryId: createProductDto.categoryId,

      // Fiyat artık kullanılmıyor.
      // Eski database alanı için 0 tutuluyor.
      price: createProductDto.price ?? 0,
      priceMax: createProductDto.priceMax ?? 0,

      imageUrl: createProductDto.imageUrl,
      description: createProductDto.description,

      segment: createProductDto.segment,

      specs: createProductDto.specs as Prisma.InputJsonValue,
    },
  });
}

async findAll(filters: {
  categoryId?: string;
  brand?: string;
  segment?: string;
  minPrice?: string;
  maxPrice?: string;
  minRam?: string;
  minStorage?: string;
  minBattery?: string;
}) {
  const {
    categoryId,
    brand,
    segment,
    minPrice,
    maxPrice,
    minRam,
    minStorage,
    minBattery,
  } = filters;

  const products = await this.prisma.product.findMany({
    where: {
      isActive: true,

      ...(categoryId && { categoryId }),

      ...(brand && { brand }),

      ...(segment && { segment }),

      ...(minPrice || maxPrice
        ? {
            price: {
              ...(minPrice && {
                gte: Number(minPrice),
              }),
              ...(maxPrice && {
                lte: Number(maxPrice),
              }),
            },
          }
        : {}),
    },

    include: {
      category: true,
      aiScore: true,
    },
  });

  return products.filter((p) => {
    const specs =
      (p.specs as Record<string, any>) || {};

    if (
      minRam &&
      (!specs.ramGb ||
        specs.ramGb < Number(minRam))
    ) {
      return false;
    }

    if (
      minStorage &&
      (!specs.storageGb ||
        specs.storageGb < Number(minStorage))
    ) {
      return false;
    }

    if (
      minBattery &&
      (!specs.batteryMah ||
        specs.batteryMah < Number(minBattery))
    ) {
      return false;
    }

    return true;
  });
}

  findOne(id: string) {
    return this.prisma.product.findUnique({
      where: { id },
      include: { category: true, aiScore: true },
    });
  }

  // Faz 3 P0 — AI Ürün Skoru.
  // Puanı comparaai-ai üretmiyor burada; admin panel comparaai-ai'ye
  // (haber analizinde olduğu gibi) doğrudan tarayıcıdan istek atıp sonucu
  // burada kaydediyor. Bu endpoint sadece sonucu ProductAiScore'a upsert eder.
  upsertAiScore(productId: string, dto: SaveAiScoreDto) {
    const data = {
      overallScore: dto.overall_score,
      performanceScore: dto.performance_score ?? null,
      cameraScore: dto.camera_score ?? null,
      batteryScore: dto.battery_score ?? null,
      softwareScore: dto.software_score ?? null,
      valueScore: dto.value_score ?? null,
      useCaseScore: (dto.use_case_score ??
        undefined) as Prisma.InputJsonValue,
      futureProofScore: dto.future_proof_score ?? null,
      aiSummary: dto.ai_summary,
      bestFor: dto.best_for ?? [],
      notFor: dto.not_for ?? [],
      weaknesses: (dto.weaknesses ?? []) as Prisma.InputJsonValue,
      suggestedSegment: dto.suggested_segment ?? null,
      modelVersion: 'gemini-3.6-flash',
    };

    return this.prisma.productAiScore.upsert({
      where: { productId },
      create: { productId, ...data },
      update: data,
    });
  }

  update(id: string, updateProductDto: UpdateProductDto) {
    return this.prisma.product.update({
      where: { id },
      data: updateProductDto as Prisma.ProductUpdateInput,
    });
  }

  remove(id: string) {
    return this.prisma.product.delete({ where: { id } });
  }
}