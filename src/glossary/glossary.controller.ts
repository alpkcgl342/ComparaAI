import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { GlossaryService } from './glossary.service';

// Kasıtlı olarak JWT korumasız: sözlük sayfası (public web) hem okuyor
// hem de (AI ürettikten sonra) cache'e yazıyor.
@Controller('glossary')
export class GlossaryController {
  constructor(private readonly glossaryService: GlossaryService) {}

  @Get()
  findAll() {
    return this.glossaryService.findAll();
  }

  @Get(':term')
  findByTerm(@Param('term') term: string) {
    return this.glossaryService.findByTerm(decodeURIComponent(term));
  }

  @Post()
  upsert(
    @Body()
    body: {
      term: string;
      level: string;
      explanation: string;
      category?: string;
      relatedTerms?: string[];
    },
  ) {
    return this.glossaryService.upsertExplanation(body);
  }
}
