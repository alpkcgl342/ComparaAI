import { ArticleModule } from './article/article.module';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { AuthModule } from './auth/auth.module';
import { ComparisonModule } from './comparison/comparison.module';

@Module({
  imports: [
    PrismaModule,
    CategoryModule,
    ProductModule,
    AuthModule,
    ArticleModule,
    ComparisonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
