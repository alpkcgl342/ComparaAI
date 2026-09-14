import { Body, Controller, Post } from '@nestjs/common';
import { ComparisonService } from './comparison.service';

// Kasıtlı olarak JWT korumasız: AI Asistan (public web) kullanıcısı
// giriş yapmadan kullanabiliyor, karşılaştırma/öneri sonuçlarını
// misafir olarak logluyoruz (bkz. comparison.service.ts).
@Controller('comparisons')
export class ComparisonController {
  constructor(private readonly comparisonService: ComparisonService) {}

  @Post()
  create(
    @Body()
    body: {
      productIds: string[];
      scenario?: string;
      result: unknown;
    },
  ) {
    return this.comparisonService.create(body);
  }
}
