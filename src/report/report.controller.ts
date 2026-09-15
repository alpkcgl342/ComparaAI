import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('reports')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  // Herkese açık: trend listesi salt SQL, AI çağrısı yok, hassas veri değil.
  @Get('trending')
  trending(@Query('days') days?: string, @Query('limit') limit?: string) {
    return this.reportService
      .trending(Number(days) || 7, Number(limit) || 20)
      .then((rows) =>
        // BigInt JSON'a doğrudan serialize edilemiyor, number'a çeviriyoruz.
        rows.map((r) => ({
          entityName: r.entityName,
          entityType: r.entityType,
          mentionCount: Number(r.mentionCount),
          weightedScore: Number(r.weightedScore),
        })),
      );
  }

  @UseGuards(JwtAuthGuard)
  @Get('context/:entityName')
  getEntityContext(@Param('entityName') entityName: string) {
    return this.reportService.getEntityContext(decodeURIComponent(entityName));
  }

  @UseGuards(JwtAuthGuard)
  @Get('recent-articles')
  getRecentArticles(@Query('days') days?: string) {
    return this.reportService.getRecentArticlesForReport(Number(days) || 7);
  }

  @Get()
  findAll(@Query('type') type?: string) {
    return this.reportService.findAll(type);
  }

  @Get('latest/:type')
  findLatestByType(@Param('type') type: string) {
    return this.reportService.findLatestByType(type);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  save(
    @Body()
    body: {
      type: string;
      title?: string;
      content: unknown;
      periodStart?: string;
      periodEnd?: string;
    },
  ) {
    return this.reportService.save(body);
  }
}
