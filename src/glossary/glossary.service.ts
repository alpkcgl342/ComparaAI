import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

// Faz 4 — Teknoloji Terimleri AI / Ansiklopedi.
// "cache-then-serve" deseni: önce burada ara, yoksa comparaai-ai'den
// üretilip buraya yazılır. Level başına ayrı kolon (explanationSimple/
// Normal/Technical/Expert) olduğu için bir terim farklı seviyelerde
// zamanla parça parça doldurulabilir.
const LEVEL_FIELD: Record<string, 'explanationSimple' | 'explanationNormal' | 'explanationTechnical' | 'explanationExpert'> = {
  basit: 'explanationSimple',
  normal: 'explanationNormal',
  teknik: 'explanationTechnical',
  uzman: 'explanationExpert',
};

@Injectable()
export class GlossaryService {
  constructor(private prisma: PrismaService) {}

  findByTerm(term: string) {
    return this.prisma.techGlossaryTerm.findFirst({
      where: { term: { equals: term.trim(), mode: 'insensitive' } },
    });
  }

  findAll() {
    return this.prisma.techGlossaryTerm.findMany({
      select: { id: true, term: true, category: true },
      orderBy: { term: 'asc' },
    });
  }

  async upsertExplanation(data: {
    term: string;
    level: string;
    explanation: string;
    category?: string;
    relatedTerms?: string[];
  }) {
    const field = LEVEL_FIELD[data.level];
    if (!field) {
      throw new Error(`Geçersiz seviye: ${data.level}`);
    }

    const existing = await this.prisma.techGlossaryTerm.findFirst({
      where: { term: { equals: data.term.trim(), mode: 'insensitive' } },
    });

    if (existing) {
      return this.prisma.techGlossaryTerm.update({
        where: { id: existing.id },
        data: {
          [field]: data.explanation,
          category: data.category ?? existing.category,
          relatedTerms:
            data.relatedTerms && data.relatedTerms.length > 0
              ? data.relatedTerms
              : existing.relatedTerms,
        },
      });
    }

    return this.prisma.techGlossaryTerm.create({
      data: {
        term: data.term.trim(),
        [field]: data.explanation,
        category: data.category,
        relatedTerms: data.relatedTerms ?? [],
      },
    });
  }
}
