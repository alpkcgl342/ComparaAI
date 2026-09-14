import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';

import { ArticleService } from './article.service';
import { SaveEntityDto } from './dto/save-entities.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

const uploadDirectory = './uploads/articles';

mkdirSync(uploadDirectory, { recursive: true });

@Controller('articles')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(
    @Body()
    data: {
      title: string;
      slug: string;
      summary?: string;
      content: string;
      imageUrl?: string;
      author?: string;
      status?: string;
      aiImportance?: string;
      aiWhyItMatters?: string;
      aiWhoItAffects?: string;
    },
  ) {
    return this.articleService.create(data);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upload-image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: uploadDirectory,
        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();
          callback(null, `${randomUUID()}${extension}`);
        },
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5 MB
      },
      fileFilter: (_req, file, callback) => {
        const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedMimeTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              'Sadece JPG, PNG veya WEBP görseller yüklenebilir.',
            ),
            false,
          );
        }
        callback(null, true);
      },
    }),
  )
  uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Görsel seçilmedi.');
    }
    return {
      url: `/uploads/articles/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get()
  findAll() {
    return this.articleService.findAll();
  }

  @Get('published')
  findPublished() {
    return this.articleService.findPublished();
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.articleService.findBySlug(slug);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.articleService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body()
    data: {
      title?: string;
      slug?: string;
      summary?: string;
      content?: string;
      imageUrl?: string;
      author?: string;
      status?: string;
      aiImportance?: string;
      aiWhyItMatters?: string;
      aiWhoItAffects?: string;
    },
  ) {
    return this.articleService.update(id, data);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.articleService.remove(id);
  }

  // Faz 2 — admin panel comparaai-ai'nin /extract-entities'ini kendisi
  // çağırır (AI ürün puanlamasındaki pattern ile aynı), sonucu buraya kaydettirir.
  @UseGuards(JwtAuthGuard)
  @Post(':id/entities')
  saveEntities(
    @Param('id') id: string,
    @Body() body: { entities: SaveEntityDto[] },
  ) {
    return this.articleService.saveEntities(id, body.entities ?? []);
  }
}