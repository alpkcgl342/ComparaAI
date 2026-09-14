import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import {
  FileInterceptor,
} from "@nestjs/platform-express";
import {
  diskStorage,
} from "multer";
import { extname } from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";

import { ProductService } from "./product.service";
import { CreateProductDto } from "./dto/create-product.dto";
import { UpdateProductDto } from "./dto/update-product.dto";
import { SaveAiScoreDto } from "./dto/ai-score.dto";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

const uploadDirectory = "./uploads/products";

mkdirSync(uploadDirectory, { recursive: true });

@Controller("products")
export class ProductController {
  constructor(
    private readonly productService: ProductService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createProductDto: CreateProductDto) {
    return this.productService.create(createProductDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post("upload-image")
  @UseInterceptors(
    FileInterceptor("file", {
      storage: diskStorage({
        destination: uploadDirectory,

        filename: (_req, file, callback) => {
          const extension = extname(file.originalname).toLowerCase();

          callback(
            null,
            `${randomUUID()}${extension}`,
          );
        },
      }),

      limits: {
        fileSize: 5 * 1024 * 1024,
      },

      fileFilter: (_req, file, callback) => {
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/webp",
        ];

        if (!allowedTypes.includes(file.mimetype)) {
          return callback(
            new BadRequestException(
              "Sadece JPG, PNG veya WEBP görseller yüklenebilir.",
            ),
            false,
          );
        }

        callback(null, true);
      },
    }),
  )
  uploadImage(
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException(
        "Görsel seçilmedi.",
      );
    }

    return {
      url: `/uploads/products/${file.filename}`,
      filename: file.filename,
    };
  }

  @Get()
  findAll(
    @Query("categoryId") categoryId?: string,
    @Query("brand") brand?: string,
    @Query("segment") segment?: string,
    @Query("minPrice") minPrice?: string,
    @Query("maxPrice") maxPrice?: string,
    @Query("minRam") minRam?: string,
    @Query("minStorage") minStorage?: string,
    @Query("minBattery") minBattery?: string,
  ) {
    return this.productService.findAll({
      categoryId,
      brand,
      segment,
      minPrice,
      maxPrice,
      minRam,
      minStorage,
      minBattery,
    });
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.productService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productService.update(
      id,
      updateProductDto,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.productService.remove(id);
  }

  // Faz 3 P0 — AI Ürün Skoru. Admin panel comparaai-ai'nin /score-product
  // endpoint'ini kendisi çağırır (haber analizindeki pattern ile aynı),
  // sonucu buraya kaydettirir.
  @UseGuards(JwtAuthGuard)
  @Post(":id/ai-score")
  saveAiScore(
    @Param("id") id: string,
    @Body() dto: SaveAiScoreDto,
  ) {
    return this.productService.upsertAiScore(id, dto);
  }
}